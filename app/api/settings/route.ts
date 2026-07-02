import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import {
  DEMO_SETTINGS_COOKIE_MAX_AGE_SECONDS,
  DEMO_SETTINGS_COOKIE_NAME,
  encodeDemoSettingsCookie,
  getDemoSecretSettings,
  mergeDemoSecretSettings
} from "@/services/demo/settings-store";

const settingsSchema = z.object({
  companyName: z.string().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  apifyToken: z.string().optional(),
  openAiApiKey: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  databaseNote: z.string().optional(),
  defaultMessage: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional()
});

const demoSettings = {
  id: "orbit-settings-demo",
  companyName: "Orbit",
  logoUrl: null,
  logoStorageKey: null,
  smtpHost: "",
  smtpUser: "",
  databaseNote: "Modo demonstracao local: PostgreSQL ainda nao esta rodando.",
  defaultMessage: "Ola {empresa}, tudo bem? Vi o trabalho de voces em {cidade}...",
  theme: "light",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export async function GET(request: Request) {
  try {
    await requirePermission("settings:read");
    const settings =
      (await withDatabaseTimeout(prisma.appSettings.findFirst())) ??
      (await withDatabaseTimeout(prisma.appSettings.create({
        data: {
          id: "orbit-settings",
          companyName: "Orbit"
        }
      })));

    return NextResponse.json(sanitizeSettings(settings));
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const demoSecrets = getDemoSecretSettings(request.headers.get("cookie"));
    return NextResponse.json(sanitizeSettings({ ...demoSettings, ...demoSecrets }));
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Configuracoes invalidas", details: parsed.error.flatten() }, { status: 400 });
  }

  const writeData = toSettingsWriteData(parsed.data);

  try {
    const user = await requirePermission("settings:write");

    const settings = await withDatabaseTimeout(prisma.appSettings.upsert({
      where: { id: "orbit-settings" },
      update: writeData,
      create: {
        id: "orbit-settings",
        companyName: parsed.data.companyName ?? "Orbit",
        logoUrl: parsed.data.logoUrl || null,
        apifyToken: parsed.data.apifyToken?.trim() || undefined,
        openAiApiKey: parsed.data.openAiApiKey?.trim() || undefined,
        smtpHost: parsed.data.smtpHost,
        smtpUser: parsed.data.smtpUser,
        smtpPassword: parsed.data.smtpPassword?.trim() || undefined,
        databaseNote: parsed.data.databaseNote,
        defaultMessage: parsed.data.defaultMessage,
        theme: parsed.data.theme ?? "light"
      }
    }));

    await recordAudit({
      action: "SETTINGS_UPDATED",
      entity: "AppSettings",
      entityId: settings.id,
      userId: user.id,
      metadata: { fields: Object.keys(parsed.data) },
      request
    });

    return NextResponse.json(sanitizeSettings(settings));
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const demoSecrets = mergeDemoSecretSettings(request.headers.get("cookie"), {
      apifyToken: parsed.data.apifyToken,
      openAiApiKey: parsed.data.openAiApiKey,
      smtpPassword: parsed.data.smtpPassword
    });
    const response = NextResponse.json(
      sanitizeSettings({
        ...demoSettings,
        ...writeData,
        ...demoSecrets,
        id: "orbit-settings-demo",
        databaseNote: "Configuracoes mantidas apenas nesta demonstracao local porque o PostgreSQL nao esta rodando."
      })
    );
    setDemoSettingsCookie(response, demoSecrets);
    return response;
  }
}

function toSettingsWriteData(data: z.infer<typeof settingsSchema>) {
  const writeData = {
    companyName: data.companyName,
    logoUrl: data.logoUrl,
    smtpHost: data.smtpHost,
    smtpUser: data.smtpUser,
    databaseNote: data.databaseNote,
    defaultMessage: data.defaultMessage,
    theme: data.theme,
    apifyToken: data.apifyToken?.trim() || undefined,
    openAiApiKey: data.openAiApiKey?.trim() || undefined,
    smtpPassword: data.smtpPassword?.trim() || undefined
  };

  return Object.fromEntries(Object.entries(writeData).filter(([, value]) => value !== undefined));
}

function sanitizeSettings(settings: Record<string, unknown>) {
  return {
    ...settings,
    apifyToken: "",
    openAiApiKey: "",
    smtpPassword: "",
    apifyTokenConfigured: Boolean(settings.apifyToken),
    openAiApiKeyConfigured: Boolean(settings.openAiApiKey),
    smtpPasswordConfigured: Boolean(settings.smtpPassword)
  };
}

function withDatabaseTimeout<T>(promise: Promise<T>, timeoutMs = 2500) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("DATABASE_TIMEOUT")), timeoutMs);
    })
  ]);
}

function setDemoSettingsCookie(response: NextResponse, settings: ReturnType<typeof getDemoSecretSettings>) {
  response.cookies.set(DEMO_SETTINGS_COOKIE_NAME, encodeDemoSettingsCookie(settings), {
    path: "/",
    maxAge: DEMO_SETTINGS_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    httpOnly: true
  });
}
