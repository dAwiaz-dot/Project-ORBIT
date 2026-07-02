import { NextResponse } from "next/server";
import { LeadRepository } from "@/repositories/lead.repository";
import { decodeDemoSearchCookie, getDemoLeadDetailsFromFilters } from "@/services/demo/demo-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoFilters = decodeDemoSearchCookie(getCookieValue(_request.headers.get("cookie"), "orbit_demo_search"));
  const lead =
    (await new LeadRepository().getDetails(id)) ??
    (demoFilters ? getDemoLeadDetailsFromFilters(demoFilters, id) : null);

  if (!lead) {
    return NextResponse.json({ error: "Lead nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ lead });
}

function getCookieValue(header: string | null, name: string) {
  return header
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
