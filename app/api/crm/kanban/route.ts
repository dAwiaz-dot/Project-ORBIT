import { NextResponse } from "next/server";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildKanbanColumns } from "@/services/crm/kanban.service";

export async function GET() {
  try {
    await requirePermission("leads:read");

    const result = await new LeadRepository().list({ pageSize: 100 });
    return NextResponse.json({
      columns: buildKanbanColumns(result.leads),
      total: result.total
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
