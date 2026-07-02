import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDemoLeadDetails, listDemoLeads, updateDemoLeadStatus } from "@/services/demo/demo-store";
import type { Lead, LeadDetail, LeadStatus, PaginatedLeadsResult } from "@/types/lead";

export type LeadListQuery = {
  q?: string;
  category?: string;
  city?: string;
  status?: LeadStatus;
  sort?: "rating-desc" | "reviews-desc" | "company-asc" | "recent-desc";
  page?: number;
  pageSize?: number;
};

export class LeadRepository {
  async list(query: LeadListQuery = {}): Promise<PaginatedLeadsResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(10, query.pageSize ?? 25));
    const where = this.buildWhere(query);

    try {
      const [rows, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          include: { category: true },
          orderBy: this.buildOrderBy(query.sort),
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.lead.count({ where })
      ]);

      return {
        leads: rows.map((lead) => this.toLead(lead)),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      };
    } catch (error) {
      console.error("Falha ao listar leads", error);
      return listDemoLeads(query);
    }
  }

  async getById(id: string): Promise<Lead | null> {
    try {
      const lead = await prisma.lead.findUnique({ where: { id }, include: { category: true } });
      return lead ? this.toLead(lead) : null;
    } catch (error) {
      console.error("Falha ao carregar lead", error);
      return getDemoLeadDetails(id);
    }
  }

  async getDetails(id: string): Promise<LeadDetail | null> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          category: true,
          owner: { select: { id: true, name: true, email: true } },
          analyses: { orderBy: { createdAt: "desc" }, take: 1 },
          followUps: { orderBy: { dueAt: "asc" } },
          documents: { orderBy: { createdAt: "desc" } },
          sales: { orderBy: { closedAt: "desc" } }
        }
      });

      if (!lead) return null;
      const latestAnalysis = lead.analyses[0] ?? null;

      return {
        ...this.toLead(lead),
        owner: lead.owner,
        analysis: latestAnalysis
          ? {
              id: latestAnalysis.id,
              potentialScore: latestAnalysis.potentialScore,
              closeProbability: latestAnalysis.closeProbability,
              grade: latestAnalysis.grade,
              stars: latestAnalysis.stars,
              reasons: toStringArray(latestAnalysis.reasons),
              opportunities: toStringArray(latestAnalysis.opportunities),
              googleMapsScore: latestAnalysis.googleMapsScore,
              siteScore: latestAnalysis.siteScore,
              instagramScore: latestAnalysis.instagramScore,
              generatedMessage: latestAnalysis.generatedMessage,
              createdAt: latestAnalysis.createdAt.toISOString()
            }
          : null,
        followUps: lead.followUps.map((followUp) => ({
          id: followUp.id,
          title: followUp.title,
          dueAt: followUp.dueAt.toISOString(),
          completedAt: followUp.completedAt?.toISOString() ?? null,
          cadenceDays: followUp.cadenceDays,
          notes: followUp.notes
        })),
        documents: lead.documents.map((document) => ({
          id: document.id,
          kind: document.kind,
          status: document.status,
          title: document.title,
          value: document.value ? Number(document.value) : null,
          deadline: document.deadline,
          fileUrl: document.fileUrl,
          createdAt: document.createdAt.toISOString()
        })),
        sales: lead.sales.map((sale) => ({
          id: sale.id,
          value: Number(sale.value),
          paymentMethod: sale.paymentMethod,
          commission: sale.commission ? Number(sale.commission) : null,
          monthlyRevenue: sale.monthlyRevenue ? Number(sale.monthlyRevenue) : null,
          profit: sale.profit ? Number(sale.profit) : null,
          closedAt: sale.closedAt.toISOString()
        }))
      };
    } catch (error) {
      console.error("Falha ao carregar detalhe do lead", error);
      return getDemoLeadDetails(id);
    }
  }

  async updateStatus(id: string, status: LeadStatus) {
    try {
      return await prisma.lead.update({ where: { id }, data: { status } });
    } catch {
      return updateDemoLeadStatus(id, status);
    }
  }

  private buildWhere(query: LeadListQuery): Prisma.LeadWhereInput {
    return {
      AND: [
        query.q
          ? {
              OR: [
                { company: { contains: query.q, mode: "insensitive" } },
                { phone: { contains: query.q, mode: "insensitive" } },
                { instagram: { contains: query.q, mode: "insensitive" } },
                { cityName: { contains: query.q, mode: "insensitive" } }
              ]
            }
          : {},
        query.category ? { category: { name: query.category } } : {},
        query.city ? { cityName: query.city } : {},
        query.status ? { status: query.status } : {}
      ]
    };
  }

  private buildOrderBy(sort: LeadListQuery["sort"]): Prisma.LeadOrderByWithRelationInput {
    if (sort === "rating-desc") return { rating: "desc" };
    if (sort === "reviews-desc") return { reviewCount: "desc" };
    if (sort === "company-asc") return { company: "asc" };
    return { createdAt: "desc" };
  }

  private toLead(lead: Prisma.LeadGetPayload<{ include: { category: true } }>): Lead {
    return {
      id: lead.id,
      company: lead.company,
      phone: lead.phone,
      address: lead.address ?? "",
      city: lead.cityName,
      state: lead.state,
      website: lead.website,
      instagram: lead.instagram,
      googleMapsUrl: lead.googleMaps,
      category: lead.category?.name ?? "Sem categoria",
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      latitude: lead.latitude,
      longitude: lead.longitude,
      hasWhatsApp: lead.hasWhatsApp,
      status: lead.status,
      createdAt: lead.createdAt.toISOString()
    };
  }
}

function toStringArray(value: Prisma.JsonValue) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}
