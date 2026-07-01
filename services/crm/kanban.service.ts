import { mockLeads } from "@/data/mock-data";
import { crmPipelineStatuses, leadStatusLabels } from "@/models/lead-status";
import type { KanbanColumn } from "@/types/crm";
import type { Lead } from "@/types/lead";

export function buildKanbanColumns(leads: Lead[] = mockLeads): KanbanColumn[] {
  return crmPipelineStatuses.map((status) => {
    const columnLeads = leads.filter((lead) => lead.status === status);
    return {
      status,
      label: leadStatusLabels[status],
      leads: columnLeads,
      totalValue: columnLeads.reduce((total, lead) => total + estimateDealValue(lead), 0)
    };
  });
}

export function estimateDealValue(lead: Lead) {
  const base = lead.category.includes("Clinica") || lead.category.includes("Dentistas") ? 2800 : 1800;
  const reputationBonus = Number(lead.reviewCount ?? 0) > 150 ? 900 : 350;
  const gapBonus = lead.website ? 0 : 1200;
  return base + reputationBonus + gapBonus;
}
