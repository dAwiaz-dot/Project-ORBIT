import { filterLeads } from "@/services/lead-filter.service";
import type { Lead, LeadDetail, LeadSearchFilters, LeadStatus, PaginatedLeadsResult } from "@/types/lead";
import type { SearchJobDto } from "@/types/search-job";

type DemoUser = {
  id: string;
  name: string | null;
  email: string | null;
};

type DemoLeadQuery = {
  q?: string;
  category?: string;
  city?: string;
  status?: LeadStatus;
  sort?: "rating-desc" | "reviews-desc" | "company-asc" | "recent-desc";
  page?: number;
  pageSize?: number;
};

type DemoState = {
  leads: Lead[];
  jobs: SearchJobDto[];
};

const globalForDemo = globalThis as typeof globalThis & {
  orbitDemoState?: DemoState;
};

const demoState = (globalForDemo.orbitDemoState ??= {
  leads: [],
  jobs: []
});

const defaultDemoUser: DemoUser = {
  id: "development-admin-davi",
  name: "Davi",
  email: "davi@orbit.local"
};

export function createDemoSearchJobFromLeads(
  filters: LeadSearchFilters,
  rawLeads: Lead[],
  user: DemoUser | null = defaultDemoUser,
  source = "Apify"
) {
  const leads = filterLeads(rawLeads, filters);
  const duplicates = mergeDemoLeads(leads);
  const now = new Date().toISOString();

  const job: SearchJobDto = {
    id: `demo-job-${Date.now()}`,
    status: "SUCCEEDED",
    state: filters.state,
    city: filters.city,
    category: filters.category,
    maxResults: filters.maxResults,
    minRating: filters.minRating,
    minReviews: filters.minReviews,
    progress: 100,
    message: `${source}: ${leads.length} leads reais salvos para ${filters.category} em ${filters.city}.`,
    resultCount: leads.length,
    duplicateCount: duplicates,
    error: null,
    startedAt: now,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
    user
  };

  demoState.jobs = [job, ...demoState.jobs.filter((item) => item.id !== job.id)].slice(0, 25);
  return job;
}

export function createDemoFailedSearchJob(filters: LeadSearchFilters, error: string, user: DemoUser | null = defaultDemoUser) {
  const now = new Date().toISOString();
  const job: SearchJobDto = {
    id: `demo-job-${Date.now()}`,
    status: "FAILED",
    state: filters.state,
    city: filters.city,
    category: filters.category,
    maxResults: filters.maxResults,
    minRating: filters.minRating,
    minReviews: filters.minReviews,
    progress: 100,
    message: "Busca falhou",
    resultCount: 0,
    duplicateCount: 0,
    error,
    startedAt: now,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
    user
  };

  demoState.jobs = [job, ...demoState.jobs.filter((item) => item.id !== job.id)].slice(0, 25);
  return job;
}

export function listDemoSearchJobs() {
  return demoState.jobs;
}

export function getDemoSearchJob(id: string) {
  return demoState.jobs.find((job) => job.id === id) ?? null;
}

export function listDemoLeads(query: DemoLeadQuery = {}): PaginatedLeadsResult {
  return paginateLeads(demoState.leads, query);
}

function paginateLeads(source: Lead[], query: DemoLeadQuery = {}): PaginatedLeadsResult {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, query.pageSize ?? 25));
  let leads = [...source];

  if (query.q?.trim()) {
    const term = query.q.trim().toLowerCase();
    leads = leads.filter((lead) =>
      [lead.company, lead.phone ?? "", lead.instagram ?? "", lead.city].some((value) => value.toLowerCase().includes(term))
    );
  }

  if (query.category) leads = leads.filter((lead) => lead.category === query.category);
  if (query.city) leads = leads.filter((lead) => lead.city === query.city);
  if (query.status) leads = leads.filter((lead) => lead.status === query.status);

  leads.sort((first, second) => {
    if (query.sort === "company-asc") return first.company.localeCompare(second.company);
    if (query.sort === "reviews-desc") return Number(second.reviewCount ?? 0) - Number(first.reviewCount ?? 0);
    if (query.sort === "rating-desc") return Number(second.rating ?? 0) - Number(first.rating ?? 0);
    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });

  const total = leads.length;
  const offset = (page - 1) * pageSize;
  return {
    leads: leads.slice(offset, offset + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

export function getDemoLead(id: string) {
  return demoState.leads.find((lead) => lead.id === id) ?? null;
}

export function getDemoLeadDetails(id: string): LeadDetail | null {
  const lead = getDemoLead(id);
  if (!lead) return null;
  return buildDemoLeadDetails(lead);
}

function buildDemoLeadDetails(lead: Lead): LeadDetail {
  return {
    ...lead,
    owner: null,
    analysis: {
      id: `${lead.id}-analysis`,
      potentialScore: lead.website ? 68 : 88,
      closeProbability: lead.website ? 59 : 84,
      grade: lead.website ? "B" : "A",
      stars: lead.website ? 4 : 5,
      reasons: [
        "Boa avaliacao no Google Maps",
        lead.website ? "Possui site para otimizar" : "Nao possui site profissional",
        lead.instagram ? "Instagram encontrado para enriquecimento" : "Instagram nao identificado"
      ],
      opportunities: ["Criar presenca local mais forte", "Aumentar conversao via WhatsApp", "Melhorar prova social"],
      googleMapsScore: 86,
      siteScore: lead.website ? 62 : 20,
      instagramScore: lead.instagram ? 70 : 30,
      generatedMessage: `Ola ${lead.company}, tudo bem? Vi a presenca de voces em ${lead.city} e encontrei oportunidades para gerar mais clientes com marketing digital.`,
      createdAt: new Date().toISOString()
    },
    followUps: [],
    documents: [],
    sales: []
  };
}

export function updateDemoLeadStatus(id: string, status: LeadStatus) {
  let updated: Lead | null = null;
  demoState.leads = demoState.leads.map((lead) => {
    if (lead.id !== id) return lead;
    updated = { ...lead, status };
    return updated;
  });
  return updated;
}

function mergeDemoLeads(leads: Lead[]) {
  const existingKeys = new Set(demoState.leads.map(getLeadKey));
  const uniqueLeads = leads.filter((lead) => !existingKeys.has(getLeadKey(lead)));
  demoState.leads = [...uniqueLeads, ...demoState.leads].slice(0, 500);
  return leads.length - uniqueLeads.length;
}

function getLeadKey(lead: Lead) {
  return [lead.company.trim().toLowerCase(), lead.phone ?? "", lead.city.toLowerCase()].join("|");
}
