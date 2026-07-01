import { onlyDigits } from "@/utils/formatters";

export function buildWhatsAppUrl(phone: string | null, message: string) {
  const digits = onlyDigits(phone ?? "");
  if (!digits) return "#";
  const normalized = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function applyMessageVariables(
  template: string,
  lead: {
    company?: string | null;
    city?: string | null;
    category?: string | null;
  }
) {
  return template
    .replaceAll("{empresa}", lead.company ?? "")
    .replaceAll("{cidade}", lead.city ?? "")
    .replaceAll("{categoria}", lead.category ?? "");
}
