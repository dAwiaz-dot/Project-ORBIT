import { NextResponse } from "next/server";
import { z } from "zod";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildCommercialDocument, renderCommercialDocumentPdf } from "@/services/documents/commercial-document.service";

export const runtime = "nodejs";

const quoteSchema = z.object({
  leadId: z.string().optional(),
  value: z.coerce.number().min(1).default(1800),
  deadline: z.string().default("15 dias"),
  services: z.array(z.string()).default(["Diagnostico digital", "Landing page", "Campanha local"])
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = quoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido", details: parsed.error.flatten() }, { status: 400 });
  }

  const repository = new LeadRepository();
  const lead = parsed.data.leadId ? await repository.getById(parsed.data.leadId) : (await repository.list({ pageSize: 1 })).leads[0];
  if (!lead) return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 });

  const document = buildCommercialDocument("quote", { lead, value: parsed.data.value, deadline: parsed.data.deadline, services: parsed.data.services });
  const pdf = await renderCommercialDocumentPdf(document);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${document.fileName}`
    }
  });
}
