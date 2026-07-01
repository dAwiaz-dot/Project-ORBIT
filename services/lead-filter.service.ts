import type { Lead, LeadSearchFilters } from "@/types/lead";
import { onlyDigits } from "@/utils/formatters";

export function filterLeads(leads: Lead[], filters: Partial<LeadSearchFilters>) {
  let result = [...leads];

  if (filters.ignoreDuplicates) {
    const seen = new Set<string>();
    result = result.filter((lead) => {
      const key = [lead.company.trim().toLowerCase(), onlyDigits(lead.phone ?? ""), lead.city.toLowerCase()].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (filters.onlyWithPhone) {
    result = result.filter((lead) => Boolean(onlyDigits(lead.phone ?? "")));
  }

  if (filters.onlyWithWhatsApp) {
    result = result.filter((lead) => lead.hasWhatsApp);
  }

  if (filters.onlyWithoutWebsite) {
    result = result.filter((lead) => !lead.website);
  }

  if (filters.state) {
    result = result.filter((lead) => lead.state.toLowerCase() === filters.state?.toLowerCase());
  }

  if (filters.city) {
    result = result.filter((lead) => lead.city.toLowerCase() === filters.city?.toLowerCase());
  }

  if (filters.category) {
    result = result.filter((lead) => lead.category.toLowerCase() === filters.category?.toLowerCase());
  }

  if (typeof filters.minRating === "number") {
    result = result.filter((lead) => Number(lead.rating ?? 0) >= Number(filters.minRating));
  }

  if (typeof filters.minReviews === "number") {
    result = result.filter((lead) => Number(lead.reviewCount ?? 0) >= Number(filters.minReviews));
  }

  return result.slice(0, filters.maxResults ?? result.length);
}
