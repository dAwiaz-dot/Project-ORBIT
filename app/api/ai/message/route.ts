import { NextResponse } from "next/server";
import { z } from "zod";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { LeadRepository } from "@/repositories/lead.repository";
import { LeadIntelligenceService } from "@/services/ai/lead-intelligence.service";
import { generateUniqueLeadMessage } from "@/services/ai/message-generator.service";

const messageSchema = z.object({
  leadId: z.string().optional()
});

export async function POST(request: Request) {
  try {
    await requirePermission("leads:read");

    const body = await request.json().catch(() => ({}));
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    const repository = new LeadRepository();
    const lead = parsed.data.leadId ? await repository.getById(parsed.data.leadId) : (await repository.list({ pageSize: 1 })).leads[0];

    if (!lead) {
      return NextResponse.json({ error: "Lead nao encontrado" }, { status: 404 });
    }

    const analysis = new LeadIntelligenceService().analyze(lead);
    return NextResponse.json({
      leadId: lead.id,
      message: generateUniqueLeadMessage(lead, analysis.reasons, analysis.opportunities)
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
