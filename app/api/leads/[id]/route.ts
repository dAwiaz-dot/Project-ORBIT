import { NextResponse } from "next/server";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { LeadRepository } from "@/repositories/lead.repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("leads:read");

    const { id } = await params;
    const lead = await new LeadRepository().getDetails(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado." }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
