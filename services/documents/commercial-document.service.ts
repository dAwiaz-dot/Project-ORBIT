import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { CommercialDocument, CommercialDocumentInput, CommercialDocumentKind } from "@/types/documents";

export function buildCommercialDocument(kind: CommercialDocumentKind, input: CommercialDocumentInput): CommercialDocument {
  const label = {
    proposal: "Proposta Comercial",
    contract: "Contrato de Prestacao de Servicos",
    quote: "Orcamento Comercial"
  }[kind];

  return {
    kind,
    title: `${label} - ${input.lead.company}`,
    fileName: `${kind}-${input.lead.company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
    createdAt: new Date().toISOString(),
    sections: [
      {
        title: "Contexto",
        body: `${input.lead.company} atua em ${input.lead.category} na cidade de ${input.lead.city}. A Orbit identificou oportunidades para ampliar a presenca digital e gerar novos contatos qualificados.`
      },
      {
        title: "Plano recomendado",
        body: `Servicos incluidos: ${input.services.join(", ")}. O projeto sera conduzido com foco em posicionamento local, conversao pelo WhatsApp e melhoria da prova social.`
      },
      {
        title: "Investimento",
        body: `Valor proposto: ${input.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. Prazo: ${input.deadline}.`
      },
      {
        title: "Proximos passos",
        body: "Apos aprovacao, a Orbit agenda o kickoff, coleta acessos e inicia a producao dos ativos comerciais."
      }
    ]
  };
}

export async function renderCommercialDocumentPdf(document: CommercialDocument) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = page.getWidth();

  page.drawRectangle({ x: 0, y: 746, width, height: 96, color: rgb(0.063, 0.094, 0.157) });
  page.drawText("Orbit", { x: 48, y: 790, size: 24, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Prospeccao, CRM e crescimento digital", { x: 118, y: 797, size: 10, font: regular, color: rgb(0.086, 0.721, 0.651) });

  page.drawText(document.title, { x: 48, y: 700, size: 21, font: bold, color: rgb(0.063, 0.094, 0.157) });

  let y = 654;
  for (const section of document.sections) {
    page.drawText(section.title, { x: 48, y, size: 13, font: bold, color: rgb(0.118, 0.408, 1) });
    y -= 22;
    for (const line of wrapText(section.body, 92)) {
      page.drawText(line, { x: 48, y, size: 10.5, font: regular, color: rgb(0.203, 0.251, 0.329) });
      y -= 16;
    }
    y -= 16;
  }

  page.drawText(`Gerado em ${new Date(document.createdAt).toLocaleDateString("pt-BR")}`, {
    x: 48,
    y: 48,
    size: 9,
    font: regular,
    color: rgb(0.4, 0.44, 0.52)
  });

  return Buffer.from(await pdf.save());
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}
