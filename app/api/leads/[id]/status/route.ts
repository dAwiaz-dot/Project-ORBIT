import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const statusSchema = z.object({
  status: z.enum(["NEW", "SENT", "REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "CLIENT", "LOST"])
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requirePermission("leads:update");
    const { id } = await params;
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Status invalido" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: parsed.data.status }
    });

    await recordAudit({
      action: "LEAD_STATUS_UPDATED",
      entity: "Lead",
      entityId: id,
      leadId: id,
      userId: user.id,
      metadata: { status: parsed.data.status },
      request
    });

    return NextResponse.json(lead);
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ error: "Nao foi possivel atualizar o status." }, { status: 500 });
  }
}
