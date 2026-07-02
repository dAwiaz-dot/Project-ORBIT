import { SearchJobStatus, type Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApifyGoogleMapsService } from "@/services/apify.service";
import { recordAudit } from "@/services/audit/audit.service";
import { filterLeads } from "@/services/lead-filter.service";
import type { Lead, LeadSearchFilters } from "@/types/lead";
import type { SearchJobDto } from "@/types/search-job";

export const searchJobSchema = z.object({
  state: z.string().min(2),
  city: z.string().min(2),
  category: z.string().min(2),
  maxResults: z.coerce.number().min(1).max(500).default(50),
  minRating: z.coerce.number().min(0).max(5).default(0),
  minReviews: z.coerce.number().min(0).default(0),
  onlyWithoutWebsite: z.boolean().default(false),
  onlyWithPhone: z.boolean().default(true),
  onlyWithWhatsApp: z.boolean().default(false),
  ignoreDuplicates: z.boolean().default(true)
});

export type SearchJobInput = z.infer<typeof searchJobSchema>;
type JobWithUser = Prisma.SearchJobGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;

const runningJobs = new Set<string>();
const terminalStatuses = new Set<SearchJobStatus>([SearchJobStatus.SUCCEEDED, SearchJobStatus.FAILED, SearchJobStatus.CANCELLED]);

export function toSearchJobDto(job: JobWithUser): SearchJobDto {
  return {
    id: job.id,
    status: job.status,
    state: job.state,
    city: job.city,
    category: job.category,
    maxResults: job.maxResults,
    minRating: job.minRating,
    minReviews: job.minReviews,
    progress: job.progress,
    message: job.message,
    resultCount: job.resultCount,
    duplicateCount: job.duplicateCount,
    error: job.error,
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    user: job.user
  };
}

export async function createSearchJob(filters: SearchJobInput, userId?: string) {
  return prisma.searchJob.create({
    data: {
      state: filters.state,
      city: filters.city,
      category: filters.category,
      maxResults: filters.maxResults,
      minRating: filters.minRating,
      minReviews: filters.minReviews,
      filters,
      userId,
      message: "Busca adicionada a fila"
    },
    include: { user: { select: { id: true, name: true, email: true } } }
  });
}

export async function processSearchJob(jobId: string) {
  if (runningJobs.has(jobId)) return;
  runningJobs.add(jobId);

  try {
    const job = await prisma.searchJob.findUnique({
      where: { id: jobId }
    });

    if (!job || terminalStatuses.has(job.status)) return;

    const filters: LeadSearchFilters = searchJobSchema.parse(job.filters);
    await updateJob(jobId, {
      status: SearchJobStatus.RUNNING,
      startedAt: new Date(),
      progress: 10,
      message: "Conectando na Apify"
    });

    const settings = await prisma.appSettings.findFirst({ select: { apifyToken: true } });
    const token = settings?.apifyToken?.trim() || process.env.APIFY_TOKEN || "";
    if (!token) {
      throw new Error("Apify Token nao configurado. Cadastre o token em Configuracoes para buscar leads reais.");
    }

    const service = new ApifyGoogleMapsService(token);
    await updateJob(jobId, { progress: 25, message: "Coletando empresas reais no Google Maps via Apify" });
    const rawLeads = await service.search(filters);

    await updateJob(jobId, { progress: 65, message: "Aplicando filtros e removendo duplicados" });
    const leads = filterLeads(rawLeads, filters);
    const duplicates = Math.max(0, rawLeads.length - leads.length);

    await updateJob(jobId, { progress: 78, message: "Gravando leads no PostgreSQL" });
    const saved = await persistLeads(leads);

    await prisma.searchHistory.create({
      data: {
        state: filters.state,
        city: filters.city,
        category: filters.category,
        maxResults: filters.maxResults,
        minRating: filters.minRating,
        minReviews: filters.minReviews,
        filters,
        leadsFound: saved,
        duplicates,
        userId: job.userId
      }
    });

    await updateJob(jobId, {
      status: SearchJobStatus.SUCCEEDED,
      progress: 100,
      message: "Busca concluida",
      resultCount: saved,
      duplicateCount: duplicates,
      completedAt: new Date()
    });

    await recordAudit({
      action: "SEARCH_JOB_SUCCEEDED",
      entity: "SearchJob",
      entityId: jobId,
      userId: job.userId,
      metadata: { saved, duplicates }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada na busca.";
    const job = await prisma.searchJob
      .update({
        where: { id: jobId },
        data: {
          status: SearchJobStatus.FAILED,
          progress: 100,
          message: "Busca falhou",
          error: message,
          completedAt: new Date()
        }
      })
      .catch(() => null);

    await recordAudit({
      action: "SEARCH_JOB_FAILED",
      entity: "SearchJob",
      entityId: jobId,
      userId: job?.userId,
      metadata: { error: message }
    });
  } finally {
    runningJobs.delete(jobId);
  }
}

async function updateJob(jobId: string, data: Prisma.SearchJobUpdateInput) {
  await prisma.searchJob.update({ where: { id: jobId }, data });
}

async function persistLeads(leads: Lead[]) {
  let saved = 0;

  for (const lead of leads) {
    const category = await prisma.category.upsert({
      where: { name: lead.category },
      update: {},
      create: { name: lead.category }
    });

    const city = await prisma.city.upsert({
      where: { name_state: { name: lead.city, state: lead.state } },
      update: {},
      create: { name: lead.city, state: lead.state }
    });

    await prisma.lead.upsert({
      where: {
        company_phone_cityName: {
          company: lead.company,
          phone: lead.phone ?? "",
          cityName: lead.city
        }
      },
      update: {
        website: lead.website,
        instagram: lead.instagram,
        googleMaps: lead.googleMapsUrl,
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        latitude: lead.latitude,
        longitude: lead.longitude,
        hasWhatsApp: lead.hasWhatsApp,
        categoryId: category.id,
        cityId: city.id,
        rawPayload: lead
      },
      create: {
        company: lead.company,
        phone: lead.phone ?? "",
        address: lead.address,
        cityName: lead.city,
        state: lead.state,
        website: lead.website,
        instagram: lead.instagram,
        googleMaps: lead.googleMapsUrl,
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        latitude: lead.latitude,
        longitude: lead.longitude,
        hasWhatsApp: lead.hasWhatsApp,
        status: lead.status,
        categoryId: category.id,
        cityId: city.id,
        rawPayload: lead
      }
    });
    saved += 1;
  }

  return saved;
}
