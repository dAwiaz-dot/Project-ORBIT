import type { Lead, LeadStatus } from "@/types/lead";

export type KanbanColumn = {
  status: LeadStatus;
  label: string;
  leads: Lead[];
  totalValue: number;
};

export type DashboardMetrics = {
  totalLeads: number;
  leadsToday: number;
  leadsWeek: number;
  leadsMonth: number;
  conversionRate: number;
  closedClients: number;
  revenue: number;
};

export type FollowUpCadence = {
  label: string;
  daysAfterContact: number;
};

export type AutomationRuleView = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
};
