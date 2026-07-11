import { NextResponse } from "next/server";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildDashboardMetrics } from "@/services/crm/dashboard-metrics.service";

export async function GET() {
  try {
    await requirePermission("leads:read");

    const result = await new LeadRepository().list({ pageSize: 100 });
    return NextResponse.json(buildDashboardMetrics(result.leads));
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
