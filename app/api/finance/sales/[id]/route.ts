import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("finance:write");
    const { id } = await params;

    await prisma.sale.delete({ where: { id } }).catch(() => null);

    await recordAudit({
      action: "SALE_DELETED",
      entity: "Sale",
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
