import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const saleSchema = z.object({
  clientName: z.string().min(2).max(120),
  leadId: z.string().optional(),
  value: z.coerce.number().min(0.01),
  paymentMethod: z.nativeEnum(PaymentMethod),
  commissionPercent: z.coerce.number().min(0).max(100).default(10),
  closedAt: z.coerce.date().optional()
});

export async function GET() {
  try {
    await requirePermission("finance:read");

    const sales = await prisma.sale.findMany({
      orderBy: { closedAt: "desc" },
      include: { user: { select: { id: true, name: true } } }
    });

    return NextResponse.json({ sales });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("finance:write");

    const body = await request.json().catch(() => ({}));
    const parsed = saleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados de venda invalidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { clientName, leadId, value, paymentMethod, commissionPercent, closedAt } = parsed.data;
    const commission = Math.round(value * (commissionPercent / 100) * 100) / 100;
    const profit = Math.round((value - commission) * 100) / 100;

    const sale = await prisma.sale.create({
      data: {
        clientName,
        leadId: leadId || null,
        userId: user.id,
        value,
        paymentMethod,
        commission,
        monthlyRevenue: value,
        profit,
        closedAt: closedAt ?? new Date()
      },
      include: { user: { select: { id: true, name: true } } }
    });

    await recordAudit({
      action: "SALE_CREATED",
      entity: "Sale",
      entityId: sale.id,
      userId: user.id,
      metadata: { clientName, value, paymentMethod },
      request
    });

    return NextResponse.json({ sale }, { status: 201 });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }
}
