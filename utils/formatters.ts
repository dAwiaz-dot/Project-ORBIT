export function formatPhone(phone: string | null) {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatRating(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
