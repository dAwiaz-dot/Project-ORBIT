import test from "node:test";
import assert from "node:assert/strict";
import { buildCsv, buildLeadsWorkbook } from "../services/export.service";
import type { Lead } from "../types/lead";

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "lead-1",
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
    createdAt: "2026-07-01T12:00:00.000Z",
    ...overrides
  };
}

test("buildCsv escapes commas and quotes", () => {
  const csv = buildCsv([makeLead({ company: 'Clinica, "Alfa"' })]);
  assert.match(csv, /"Clinica, ""Alfa"""/);
  assert.match(csv, /Empresa,Categoria,Cidade/);
});

test("buildLeadsWorkbook creates one tab per category plus Todos", () => {
  const workbook = buildLeadsWorkbook([
    makeLead({ id: "1", category: "Dentistas" }),
    makeLead({ id: "2", category: "Pet Shops", company: "Pet Alfa" })
  ]);

  assert.ok(workbook.getWorksheet("Dentistas"));
  assert.ok(workbook.getWorksheet("Pet Shops"));
  assert.ok(workbook.getWorksheet("Todos"));
});
