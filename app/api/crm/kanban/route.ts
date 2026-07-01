import { NextResponse } from "next/server";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildKanbanColumns } from "@/services/crm/kanban.service";

export async function GET() {
  const result = await new LeadRepository().list({ pageSize: 100 });
  return NextResponse.json({
    columns: buildKanbanColumns(result.leads),
    total: result.total
  });
}
