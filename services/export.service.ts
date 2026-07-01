import ExcelJS from "exceljs";
import type { Lead } from "@/types/lead";

const exportColumns = [
  "Empresa",
  "Categoria",
  "Cidade",
  "Estado",
  "Telefone",
  "Instagram",
  "Site",
  "Google Maps",
  "Nota",
  "Avaliacoes",
  "WhatsApp",
  "Status"
] as const;

type ExportColumn = (typeof exportColumns)[number];
type ExportRow = Record<ExportColumn, string | number>;

export function leadsToRows(leads: Lead[]): ExportRow[] {
  return leads.map((lead) => ({
    Empresa: lead.company,
    Categoria: lead.category,
    Cidade: lead.city,
    Estado: lead.state,
    Telefone: lead.phone ?? "",
    Instagram: lead.instagram ?? "",
    Site: lead.website ?? "",
    "Google Maps": lead.googleMapsUrl ?? "",
    Nota: lead.rating ?? "",
    Avaliacoes: lead.reviewCount ?? "",
    WhatsApp: lead.hasWhatsApp ? "Sim" : "Nao",
    Status: lead.status
  }));
}

export function buildLeadsWorkbook(leads: Lead[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Orbit Leads";
  workbook.created = new Date();

  const categories = Array.from(new Set(leads.map((lead) => lead.category))).sort();

  for (const category of categories) {
    const rows = leadsToRows(leads.filter((lead) => lead.category === category));
    appendWorksheet(workbook, safeSheetName(category), rows);
  }

  appendWorksheet(workbook, "Todos", leadsToRows(leads));

  return workbook;
}

export function buildCsv(leads: Lead[]) {
  const rows = leadsToRows(leads);
  return [exportColumns.join(","), ...rows.map((row) => exportColumns.map((column) => csvEscape(row[column])).join(","))].join("\n");
}

function safeSheetName(name: string) {
  return name.replace(/[\\/?*[\]:]/g, "").slice(0, 31) || "Categoria";
}

function appendWorksheet(workbook: ExcelJS.Workbook, name: string, rows: ExportRow[]) {
  const worksheet = workbook.addWorksheet(name);
  worksheet.addRow(exportColumns);
  worksheet.addRows(rows.map((row) => exportColumns.map((column) => row[column])));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF101828" }
  };

  worksheet.columns.forEach((column) => {
    column.width = 18;
  });
}

function csvEscape(value: string | number) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}
