import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const updateSchema = z.object({
  status: z.string().optional(),
  sentCount: z.coerce.number().int().min(0).optional(),
  replyCount: z.coerce.number().int().min(0).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("leads:update");
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Atualizacao invalida" }, { status: 400 });
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: parsed.data
    });

    await recordAudit({
      action: "CAMPAIGN_UPDATED",
      entity: "Campaign",
      entityId: campaign.id,
      userId: user.id,
      metadata: parsed.data,
      request
    });

    return NextResponse.json({ campaign });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("leads:update");
    const { id } = await params;

    await prisma.campaign.delete({ where: { id } }).catch(() => null);

    await recordAudit({
      action: "CAMPAIGN_DELETED",
      entity: "Campaign",
      entityId: id,
      userId: user.id,
      request
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
