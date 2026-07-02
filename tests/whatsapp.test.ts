import test from "node:test";
import assert from "node:assert/strict";
import { applyMessageVariables, buildWhatsAppUrl } from "../services/whatsapp.service";

test("buildWhatsAppUrl normalizes Brazilian numbers and encodes text", () => {
  const url = buildWhatsAppUrl("(35) 99999-0000", "Ola Clinica Alfa");
  assert.equal(url, "https://wa.me/5535999990000?text=Ola%20Clinica%20Alfa");
});

test("buildWhatsAppUrl returns a safe placeholder without phone", () => {
  assert.equal(buildWhatsAppUrl(null, "Ola"), "#");
});

test("applyMessageVariables replaces Orbit placeholders", () => {
  const message = applyMessageVariables("Ola {empresa} de {cidade}, categoria {categoria}", {
    company: "Clinica Alfa",
    city: "Pouso Alegre",
    category: "Dentistas"
  });

  assert.equal(message, "Ola Clinica Alfa de Pouso Alegre, categoria Dentistas");
});
