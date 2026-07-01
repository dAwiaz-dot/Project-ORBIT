import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { mockLeads } from "@/data/mock-data";
import type { Lead, LeadStatus, PaginatedLeadsResult } from "@/types/lead";

export type LeadListQuery = {
  q?: string;
  category?: string;
  city?: string;
  status?: LeadStatus;
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
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize
        }),
        prisma.lead.count({ where })
      ]);

      return {
        leads: rows.map((lead) => ({
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
        })),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      };
    } catch {
      return this.listFallback(query, page, pageSize);
    }
  }

  async getById(id: string): Promise<Lead | null> {
    const fallback = mockLeads.find((lead) => lead.id === id) ?? mockLeads[0] ?? null;

    try {
      const lead = await prisma.lead.findUnique({ where: { id }, include: { category: true } });
      if (!lead) return fallback;

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
    } catch {
      return fallback;
    }
  }

  async updateStatus(id: string, status: LeadStatus) {
    try {
      return await prisma.lead.update({ where: { id }, data: { status } });
    } catch {
      return null;
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

  private listFallback(query: LeadListQuery, page: number, pageSize: number): PaginatedLeadsResult {
    const q = query.q?.toLowerCase() ?? "";
    const filtered = mockLeads.filter((lead) => {
      const matchesQuery =
        !q || [lead.company, lead.phone, lead.instagram, lead.city, lead.category].some((field) => String(field ?? "").toLowerCase().includes(q));
      const matchesCategory = !query.category || lead.category === query.category;
      const matchesCity = !query.city || lead.city === query.city;
      const matchesStatus = !query.status || lead.status === query.status;
      return matchesQuery && matchesCategory && matchesCity && matchesStatus;
    });
    const start = (page - 1) * pageSize;

    return {
      leads: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize))
    };
  }
}
