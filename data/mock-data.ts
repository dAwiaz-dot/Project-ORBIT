import type { Lead, LeadMetric } from "@/types/lead";

export const mockLeads: Lead[] = [];

export const leadMetrics: LeadMetric[] = [
  { label: "Total de Leads", value: "0", trend: "Base limpa", tone: "blue" },
  { label: "Sem Site", value: "0", trend: "Aguardando buscas", tone: "amber" },
  { label: "Com WhatsApp", value: "0", trend: "Aguardando validacao", tone: "green" },
  { label: "Com Instagram", value: "0", trend: "Aguardando enriquecimento", tone: "rose" },
  { label: "Hoje", value: "0", trend: "Nenhuma busca ainda", tone: "slate" },
  { label: "Esta Semana", value: "0", trend: "Pronto para operar", tone: "blue" },
  { label: "Este Mes", value: "0", trend: "Base zerada", tone: "green" }
];

export const growthData = [
  { label: "Jan", leads: 0, qualified: 0 },
  { label: "Fev", leads: 0, qualified: 0 },
  { label: "Mar", leads: 0, qualified: 0 },
  { label: "Abr", leads: 0, qualified: 0 },
  { label: "Mai", leads: 0, qualified: 0 },
  { label: "Jun", leads: 0, qualified: 0 },
  { label: "Jul", leads: 0, qualified: 0 }
];

export const cityData: Array<{ city: string; leads: number }> = [];

export const categoryData: Array<{ category: string; value: number }> = [];

export const recentSearches: string[] = [];
