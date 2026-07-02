import test from "node:test";
import assert from "node:assert/strict";
import { buildApifyRunInput, normalizeApifyActorId } from "../services/apify.service";
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
    maxCrawledPlaces: 7,
    language: "pt-BR",
    skipClosedPlaces: true,
    includeWebResults: true,
    proxyConfig: {
      useApifyProxy: true
    }
  });
});
