import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import { uploadLogoToExternalStorage } from "@/services/storage/logo-storage.service";

export const runtime = "nodejs";

const maxLogoSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await requirePermission("settings:write");
    const formData = await request.formData();
    const file = formData.get("logo");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo da logo nao enviado." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "A logo precisa ser uma imagem." }, { status: 400 });
    }

    if (file.size > maxLogoSize) {
      return NextResponse.json({ error: "A logo precisa ter no maximo 5MB." }, { status: 400 });
    }

    const stored = await uploadLogoToExternalStorage(file);
    const asset = await prisma.logoAsset.create({
      data: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        provider: stored.provider,
        storageKey: stored.storageKey,
        publicUrl: stored.publicUrl,
        uploadedById: user.id
      }
    });

    const settings = await prisma.appSettings.upsert({
      where: { id: "orbit-settings" },
      update: {
        logoUrl: stored.publicUrl,
        logoStorageKey: stored.storageKey
      },
      create: {
        id: "orbit-settings",
        companyName: "Orbit",
        logoUrl: stored.publicUrl,
        logoStorageKey: stored.storageKey
      }
    });

    await recordAudit({
      action: "LOGO_UPLOADED",
      entity: "LogoAsset",
      entityId: asset.id,
      userId: user.id,
      metadata: { provider: stored.provider, size: file.size },
      request
    });

    return NextResponse.json({ asset, settings });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const message = error instanceof Error ? error.message : "Nao foi possivel enviar a logo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
