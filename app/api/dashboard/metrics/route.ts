import { NextResponse } from "next/server";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildDashboardMetrics } from "@/services/crm/dashboard-metrics.service";

export async function GET() {
  const result = await new LeadRepository().list({ pageSize: 100 });
  return NextResponse.json(buildDashboardMetrics(result.leads));
}
