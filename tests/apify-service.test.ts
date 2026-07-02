import test from "node:test";
import assert from "node:assert/strict";
import { buildApifyRunInput, normalizeApifyActorId, normalizeApifyPlace } from "../services/apify.service";
import { filterLeads } from "../services/lead-filter.service";
import type { LeadSearchFilters } from "../types/lead";

const filters: LeadSearchFilters = {
  state: "MG",
  city: "Pouso Alegre",
  category: "Dentistas",
  maxResults: 7,
  minRating: 4,
  minReviews: 20,
  onlyWithoutWebsite: false,
  onlyWithPhone: true,
  onlyWithWhatsApp: false,
  ignoreDuplicates: true
};

test("normalizeApifyActorId converts store slugs to Apify API ids", () => {
  assert.equal(normalizeApifyActorId("compass/crawler-google-places"), "compass~crawler-google-places");
  assert.equal(normalizeApifyActorId("compass~crawler-google-places"), "compass~crawler-google-places");
});

test("buildApifyRunInput uses Google Maps Scraper compatible fields", () => {
  assert.deepEqual(buildApifyRunInput(filters), {
    searchString: "Dentistas em Pouso Alegre MG",
    searchStringsArray: ["Dentistas em Pouso Alegre MG"],
    maxCrawledPlaces: 7,
    maxCrawledPlacesPerSearch: 7,
    language: "pt-BR",
    skipClosedPlaces: true,
    includeWebResults: true,
    proxyConfig: {
      useApifyProxy: true
    }
  });
});

test("normalizeApifyPlace keeps requested city state and category for filtering", () => {
  const lead = normalizeApifyPlace(
    {
      title: "Clínica Real",
      phoneUnformatted: "+55 35 99999-0000",
      address: "Rua Central, 10",
      city: "",
      state: "Minas Gerais",
      categoryName: "Dentist",
      totalScore: 4.9,
      reviewsCount: 120,
      website: "",
      url: "https://maps.google.com/?cid=123",
      location: { lat: -22.22, lng: -45.45 }
    },
    filters,
    0
  );

  assert.equal(lead.city, "Pouso Alegre");
  assert.equal(lead.state, "MG");
  assert.equal(lead.category, "Dentistas");
  assert.equal(lead.website, null);
  assert.deepEqual(filterLeads([lead], { ...filters, onlyWithoutWebsite: true, onlyWithWhatsApp: true }).map((item) => item.company), ["Clínica Real"]);
});
