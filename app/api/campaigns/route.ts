import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const campaignSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.string().optional(),
  city: z.string().optional()
});

export async function GET() {
  try {
    await requirePermission("leads:read");

    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ campaigns });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("leads:update");

    const body = await request.json().catch(() => ({}));
    const parsed = campaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Campanha invalida", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, category, city } = parsed.data;

    const matchingLeads = await prisma.lead.findMany({
      where: {
        ...(category ? { category: { name: category } } : {}),
        ...(city ? { cityName: city } : {})
      },
      select: { status: true }
    });

    const totalLeads = matchingLeads.length;
    const sentCount = matchingLeads.filter((lead) => lead.status !== "NEW").length;
    const replyCount = matchingLeads.filter((lead) =>
      ["REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "CLIENT"].includes(lead.status)
    ).length;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        category,
        city,
        status: totalLeads > 0 ? "ATIVA" : "DRAFT",
        totalLeads,
        sentCount,
        replyCount
      }
    });

    await recordAudit({
      action: "CAMPAIGN_CREATED",
      entity: "Campaign",
      entityId: campaign.id,
      userId: user.id,
      metadata: { name, category, city, totalLeads },
      request
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
