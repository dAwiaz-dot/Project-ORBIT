import test from "node:test";
import assert from "node:assert/strict";
import { createDemoSearchJobFromLeads, listDemoLeads } from "../services/demo/demo-store";
import {
  DEMO_SETTINGS_COOKIE_NAME,
  encodeDemoSettingsCookie,
  getDemoSecretSettings,
  mergeDemoSecretSettings
} from "../services/demo/settings-store";
import type { Lead, LeadSearchFilters } from "../types/lead";

const filters: LeadSearchFilters = {
  state: "MG",
  city: "Cidade Apify Teste",
  category: "Categoria Apify Teste",
  maxResults: 10,
  minRating: 4,
  minReviews: 10,
  onlyWithoutWebsite: true,
  onlyWithPhone: true,
  onlyWithWhatsApp: true,
  ignoreDuplicates: true
};

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "apify-real-1",
    company: "Empresa Real Apify",
    phone: "35999990000",
    address: "Rua Orbit, 100",
    city: filters.city,
    state: filters.state,
    website: null,
    instagram: "@empresaapify",
    googleMapsUrl: "https://maps.google.com/?cid=123",
    category: filters.category,
    rating: 4.8,
    reviewCount: 90,
    latitude: -22.22,
    longitude: -45.45,
    hasWhatsApp: true,
    status: "NEW",
    createdAt: "2026-07-02T12:00:00.000Z",
    ...overrides
  };
}

test("demo settings cookie stores Apify token encrypted and restores it", () => {
  const token = "apify_api_test_secret_token";
  const cookieValue = encodeDemoSettingsCookie({ apifyToken: token });
  const cookieHeader = `${DEMO_SETTINGS_COOKIE_NAME}=${cookieValue}`;

  assert.equal(getDemoSecretSettings(cookieHeader).apifyToken, token);
  assert.equal(cookieValue.includes(token), false);
});

test("demo settings merge preserves existing Apify token while adding another secret", () => {
  const cookieValue = encodeDemoSettingsCookie({ apifyToken: "apify_api_saved" });
  const cookieHeader = `${DEMO_SETTINGS_COOKIE_NAME}=${cookieValue}`;

  assert.deepEqual(mergeDemoSecretSettings(cookieHeader, { openAiApiKey: "sk-test" }), {
    apifyToken: "apify_api_saved",
    openAiApiKey: "sk-test"
  });
});

test("demo search fallback stores only leads supplied by Apify response", () => {
  const accepted = makeLead();
  const filteredOut = makeLead({
    id: "apify-filtered-out",
    company: "Empresa Com Site",
    phone: "35999991111",
    website: "https://empresa.com.br"
  });

  const job = createDemoSearchJobFromLeads(filters, [accepted, filteredOut]);
  const result = listDemoLeads({ city: filters.city, category: filters.category, pageSize: 25 });

  assert.equal(job.status, "SUCCEEDED");
  assert.equal(job.resultCount, 1);
  assert.deepEqual(
    result.leads.map((lead) => lead.company),
    ["Empresa Real Apify"]
  );
});
