import { NextResponse } from "next/server";
import { LeadRepository } from "@/repositories/lead.repository";
import type { LeadStatus } from "@/types/lead";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? 25);
  const query = {
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
    status: (url.searchParams.get("status") as LeadStatus | null) ?? undefined,
    sort: (url.searchParams.get("sort") as "rating-desc" | "reviews-desc" | "company-asc" | "recent-desc" | null) ?? undefined,
    page,
    pageSize
  };

  const result = await new LeadRepository().list(query);
  return NextResponse.json(result);
}
