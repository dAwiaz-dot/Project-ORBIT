import { NextResponse } from "next/server";
import { z } from "zod";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { LeadRepository } from "@/repositories/lead.repository";
import { buildCommercialDocument, renderCommercialDocumentPdf } from "@/services/documents/commercial-document.service";

export const runtime = "nodejs";

const proposalSchema = z.object({
  leadId: z.string().optional(),
  value: z.coerce.number().min(1).default(2800),
  deadline: z.string().default("30 dias"),
  services: z.array(z.string()).default(["Landing page", "Gestao de trafego", "CRM e WhatsApp"])
});

export async function POST(request: Request) {
  try {
    await requirePermission("leads:read");

    const body = await request.json().catch(() => ({}));
    const parsed = proposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido", details: parsed.error.flatten() }, { status: 400 });
    }

    const repository = new LeadRepository();
    const lead = parsed.data.leadId ? await repository.getById(parsed.data.leadId) : (await repository.list({ pageSize: 1 })).leads[0];

    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 });
    }

    const document = buildCommercialDocument("proposal", { lead, value: parsed.data.value, deadline: parsed.data.deadline, services: parsed.data.services });
    const pdf = await renderCommercialDocumentPdf(document);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${document.fileName}`
      }
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
