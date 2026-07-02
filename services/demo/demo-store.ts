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

export function createDemoSearchJob(filters: LeadSearchFilters, user: DemoUser | null = defaultDemoUser) {
  const rawLeads = generateDemoLeads(filters);
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
    message: `Modo demonstracao: ${leads.length} leads gerados para apresentacao.`,
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

export function generateDemoLeads(filters: LeadSearchFilters): Lead[] {
  const count = Math.max(1, Math.min(filters.maxResults || 12, 24));
  const names = ["Aurora", "Prime", "Alfa", "Nobre", "Viva", "Lumi", "Essencial", "Bella", "Delta", "Serra", "Central", "Mais"];
  const suffixes = ["Studio", "Center", "Clinic", "House", "Pro", "Digital", "Premium", "Hub"];
  const minRating = Math.max(0, Math.min(5, filters.minRating || 0));
  const minReviews = Math.max(0, filters.minReviews || 0);
  const now = new Date().toISOString();

  return Array.from({ length: count }, (_, index) => {
    const phoneRequired = filters.onlyWithPhone || filters.onlyWithWhatsApp || index % 5 !== 0;
    const phone = phoneRequired ? buildPhone(index) : null;
    const hasWhatsApp = Boolean(phone) && (filters.onlyWithWhatsApp || index % 3 !== 0);
    const rating = Math.min(5, Math.max(minRating, 4 + ((index + 2) % 9) / 10));
    const reviewCount = Math.max(minReviews, 24) + index * 11;
    const company = `${filters.category} ${names[index % names.length]} ${suffixes[index % suffixes.length]}`;
    const website = filters.onlyWithoutWebsite || index % 4 !== 0 ? null : `https://${slug(company)}.com.br`;

    return {
      id: `demo-lead-${slug(filters.state)}-${slug(filters.city)}-${slug(filters.category)}-${index}`,
      company,
      phone,
      address: `Rua Orbit, ${120 + index} - Centro`,
      city: filters.city,
      state: filters.state,
      website,
      instagram: index % 4 === 1 ? null : `@${slug(company).replaceAll("-", "")}`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company} ${filters.city}`)}`,
      category: filters.category,
      rating: Number(rating.toFixed(1)),
      reviewCount,
      latitude: -22.226 + index * 0.004,
      longitude: -45.938 - index * 0.004,
      hasWhatsApp,
      status: "NEW",
      createdAt: now
    };
  });
}

export function listDemoSearchJobs() {
  return demoState.jobs;
}

export function getDemoSearchJob(id: string) {
  return demoState.jobs.find((job) => job.id === id) ?? null;
}

export function getDemoSearchJobFromFilters(id: string, filters: LeadSearchFilters, user: DemoUser | null = defaultDemoUser) {
  const leads = filterLeads(generateDemoLeads(filters), filters);
  const now = new Date().toISOString();

  return {
    id,
    status: "SUCCEEDED",
    state: filters.state,
    city: filters.city,
    category: filters.category,
    maxResults: filters.maxResults,
    minRating: filters.minRating,
    minReviews: filters.minReviews,
    progress: 100,
    message: `Modo demonstracao: ${leads.length} leads gerados para apresentacao.`,
    resultCount: leads.length,
    duplicateCount: 0,
    error: null,
    startedAt: now,
    completedAt: now,
    createdAt: now,
    updatedAt: now,
    user
  } satisfies SearchJobDto;
}

export function listDemoLeads(query: DemoLeadQuery = {}): PaginatedLeadsResult {
  return paginateLeads(demoState.leads, query);
}

export function listDemoLeadsFromFilters(filters: LeadSearchFilters, query: DemoLeadQuery = {}) {
  const leads = filterLeads(generateDemoLeads(filters), filters);
  return paginateLeads(leads, query);
}

export function getDemoLeadFromFilters(filters: LeadSearchFilters, id: string) {
  return filterLeads(generateDemoLeads(filters), filters).find((lead) => lead.id === id) ?? null;
}

export function getDemoLeadDetailsFromFilters(filters: LeadSearchFilters, id: string): LeadDetail | null {
  const lead = getDemoLeadFromFilters(filters, id);
  return lead ? buildDemoLeadDetails(lead) : null;
}

export function encodeDemoSearchCookie(filters: LeadSearchFilters) {
  return Buffer.from(JSON.stringify(filters), "utf8").toString("base64url");
}

export function decodeDemoSearchCookie(value: string | undefined | null) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<LeadSearchFilters>;
    if (!parsed.state || !parsed.city || !parsed.category) return null;

    return {
      state: String(parsed.state),
      city: String(parsed.city),
      category: String(parsed.category),
      maxResults: Number(parsed.maxResults ?? 24),
      minRating: Number(parsed.minRating ?? 0),
      minReviews: Number(parsed.minReviews ?? 0),
      onlyWithoutWebsite: Boolean(parsed.onlyWithoutWebsite),
      onlyWithPhone: Boolean(parsed.onlyWithPhone),
      onlyWithWhatsApp: Boolean(parsed.onlyWithWhatsApp),
      ignoreDuplicates: parsed.ignoreDuplicates !== false
    } satisfies LeadSearchFilters;
  } catch {
    return null;
  }
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

function buildPhone(index: number) {
  const suffix = String(1100 + index * 37).padStart(4, "0").slice(-4);
  return `55359${8200 + index}${suffix}`;
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
