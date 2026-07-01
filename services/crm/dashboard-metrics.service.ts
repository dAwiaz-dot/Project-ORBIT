import { mockLeads } from "@/data/mock-data";
import type { DashboardMetrics } from "@/types/crm";
import type { Lead } from "@/types/lead";
import { estimateDealValue } from "@/services/crm/kanban.service";

export function buildDashboardMetrics(leads: Lead[] = mockLeads): DashboardMetrics {
  const totalLeads = leads.length;
  const closed = leads.filter((lead) => lead.status === "CLIENT");
  const revenue = closed.reduce((sum, lead) => sum + estimateDealValue(lead), 0);

  return {
    totalLeads,
    leadsToday: 0,
    leadsWeek: 0,
    leadsMonth: 0,
    conversionRate: totalLeads ? Number(((closed.length / totalLeads) * 100).toFixed(1)) : 0,
    closedClients: closed.length,
    revenue
  };
}
