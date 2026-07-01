import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApifyGoogleMapsService } from "@/services/apify.service";
import { filterLeads } from "@/services/lead-filter.service";

export const runtime = "nodejs";

const searchSchema = z.object({
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

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = searchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Filtros invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const filters = parsed.data;
  const service = new ApifyGoogleMapsService();
  const rawLeads = await service.search(filters);
  const leads = filterLeads(rawLeads, filters);

  const category = await prisma.category.upsert({
    where: { name: filters.category },
    update: {},
    create: { name: filters.category }
  });

  const city = await prisma.city.upsert({
    where: { name_state: { name: filters.city, state: filters.state } },
    update: {},
    create: { name: filters.city, state: filters.state }
  });

  let saved = 0;
  for (const lead of leads) {
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
        rating: lead.rating,
        reviewCount: lead.reviewCount,
        hasWhatsApp: lead.hasWhatsApp
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

  await prisma.searchHistory.create({
    data: {
      state: filters.state,
      city: filters.city,
      category: filters.category,
      maxResults: filters.maxResults,
      minRating: filters.minRating,
      minReviews: filters.minReviews,
      filters,
      leadsFound: leads.length,
      duplicates: Math.max(0, rawLeads.length - leads.length)
    }
  });

  return NextResponse.json({
    leads,
    meta: {
      found: rawLeads.length,
      saved,
      duplicatesRemoved: Math.max(0, rawLeads.length - leads.length)
    }
  });
}
