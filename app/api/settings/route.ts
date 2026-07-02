import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

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

export async function GET() {
  try {
    await requirePermission("settings:read");
    const settings =
      (await prisma.appSettings.findFirst()) ??
      (await prisma.appSettings.create({
        data: {
          id: "orbit-settings",
          companyName: "Orbit"
        }
      }));

    return NextResponse.json(settings);
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ error: "Nao foi possivel carregar as configuracoes." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requirePermission("settings:write");
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Configuracoes invalidas", details: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await prisma.appSettings.upsert({
      where: { id: "orbit-settings" },
      update: parsed.data,
      create: {
        id: "orbit-settings",
        companyName: parsed.data.companyName ?? "Orbit",
        logoUrl: parsed.data.logoUrl || null,
        apifyToken: parsed.data.apifyToken,
        openAiApiKey: parsed.data.openAiApiKey,
        smtpHost: parsed.data.smtpHost,
        smtpUser: parsed.data.smtpUser,
        smtpPassword: parsed.data.smtpPassword,
        databaseNote: parsed.data.databaseNote,
        defaultMessage: parsed.data.defaultMessage,
        theme: parsed.data.theme ?? "light"
      }
    });

    await recordAudit({
      action: "SETTINGS_UPDATED",
      entity: "AppSettings",
      entityId: settings.id,
      userId: user.id,
      metadata: { fields: Object.keys(parsed.data) },
      request
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ error: "Nao foi possivel salvar as configuracoes." }, { status: 500 });
  }
}
