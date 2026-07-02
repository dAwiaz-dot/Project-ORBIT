import test from "node:test";
import assert from "node:assert/strict";
import { filterLeads } from "../services/lead-filter.service";
import type { Lead } from "../types/lead";

const baseLead: Lead = {
  id: "base",
  company: "Clinica Alfa",
  phone: "35999990000",
  address: "Rua A",
  city: "Pouso Alegre",
  state: "MG",
  website: null,
  instagram: null,
  googleMapsUrl: null,
  category: "Dentistas",
  rating: 4.8,
  reviewCount: 120,
  latitude: null,
  longitude: null,
  hasWhatsApp: true,
  status: "NEW",
  createdAt: "2026-07-01T12:00:00.000Z"
};

test("filterLeads applies duplicate, phone, website, rating and review rules", () => {
  const leads: Lead[] = [
    baseLead,
    { ...baseLead, id: "duplicate" },
    { ...baseLead, id: "with-site", company: "Clinica Beta", website: "https://beta.com.br" },
    { ...baseLead, id: "no-phone", company: "Clinica Gama", phone: null, hasWhatsApp: false },
    { ...baseLead, id: "low-rating", company: "Clinica Delta", rating: 3.9 },
    { ...baseLead, id: "few-reviews", company: "Clinica Epsilon", reviewCount: 3 }
  ];

  const result = filterLeads(leads, {
    state: "MG",
    city: "Pouso Alegre",
    category: "Dentistas",
    maxResults: 10,
    minRating: 4,
    minReviews: 20,
    onlyWithoutWebsite: true,
    onlyWithPhone: true,
    onlyWithWhatsApp: true,
    ignoreDuplicates: true
  });

  assert.deepEqual(
    result.map((lead) => lead.id),
    ["base"]
  );
});

test("filterLeads respects maxResults after filtering", () => {
  const leads = Array.from({ length: 4 }, (_, index) => ({
    ...baseLead,
    id: `lead-${index}`,
    company: `Clinica ${index}`,
    phone: `3599999000${index}`
  }));

  const result = filterLeads(leads, { maxResults: 2 });
  assert.equal(result.length, 2);
});
