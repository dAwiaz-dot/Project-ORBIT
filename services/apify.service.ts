import { z } from "zod";
import type { Lead, LeadSearchFilters } from "@/types/lead";

const apifyPlaceSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().nullable().optional(),
  phoneUnformatted: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  categories: z.array(z.string()).optional(),
  categoryName: z.string().nullable().optional(),
  totalScore: z.number().nullable().optional(),
  reviewsCount: z.number().nullable().optional(),
  location: z
    .object({
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional()
    })
    .nullable()
    .optional(),
  instagram: z.string().nullable().optional()
});

export class ApifyGoogleMapsService {
  private token: string;
  private actorId: string;

  constructor(token = process.env.APIFY_TOKEN ?? "", actorId = process.env.APIFY_GOOGLE_MAPS_ACTOR_ID ?? "") {
    this.token = token;
    this.actorId = actorId || "compass/crawler-google-places";
  }

  async search(filters: LeadSearchFilters): Promise<Lead[]> {
    if (!this.token) {
      throw new Error("APIFY_TOKEN nao configurado.");
    }

    const runResponse = await fetch(`https://api.apify.com/v2/acts/${this.actorId}/runs?token=${this.token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        searchStringsArray: [`${filters.category} em ${filters.city} ${filters.state}`],
        maxCrawledPlacesPerSearch: filters.maxResults,
        language: "pt-BR",
        includeWebResults: true,
        skipClosedPlaces: true
      })
    });

    if (!runResponse.ok) {
      throw new Error(`Falha ao iniciar Apify: ${runResponse.status}`);
    }

    const run = (await runResponse.json()) as { data?: { id?: string; defaultDatasetId?: string } };
    const runId = run.data?.id;
    if (!runId) throw new Error("Apify nao retornou run id.");

    const datasetId = await this.waitForDataset(runId);
    const itemsResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&token=${this.token}`);

    if (!itemsResponse.ok) {
      throw new Error(`Falha ao carregar dataset Apify: ${itemsResponse.status}`);
    }

    const items = (await itemsResponse.json()) as unknown[];
    return items.map((item, index) => this.normalizePlace(item, filters, index));
  }

  private async waitForDataset(runId: string) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${this.token}`);
      const payload = (await response.json()) as { data?: { status?: string; defaultDatasetId?: string } };

      if (payload.data?.status === "SUCCEEDED" && payload.data.defaultDatasetId) {
        return payload.data.defaultDatasetId;
      }

      if (payload.data?.status === "FAILED" || payload.data?.status === "ABORTED") {
        throw new Error(`Run Apify finalizada com status ${payload.data.status}.`);
      }
    }

    throw new Error("Tempo limite aguardando resultados da Apify.");
  }

  private normalizePlace(item: unknown, filters: LeadSearchFilters, index: number): Lead {
    const parsed = apifyPlaceSchema.safeParse(item);
    const place = parsed.success ? parsed.data : {};
    const company = place.title ?? place.name ?? `Empresa ${index + 1}`;
    const phone = place.phoneUnformatted ?? place.phone ?? null;

    return {
      id: `${company}-${index}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      company,
      phone,
      address: place.address ?? "",
      city: place.city ?? filters.city,
      state: place.state ?? filters.state,
      website: place.website ?? null,
      instagram: place.instagram ?? null,
      googleMapsUrl: place.url ?? null,
      category: place.categoryName ?? place.categories?.[0] ?? filters.category,
      rating: place.totalScore ?? null,
      reviewCount: place.reviewsCount ?? null,
      latitude: place.location?.lat ?? null,
      longitude: place.location?.lng ?? null,
      hasWhatsApp: Boolean(phone),
      status: "NEW",
      createdAt: new Date().toISOString()
    };
  }
}
