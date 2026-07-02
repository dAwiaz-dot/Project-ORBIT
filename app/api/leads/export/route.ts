import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import { buildCsv, buildLeadsWorkbook } from "@/services/export.service";
import type { Lead } from "@/types/lead";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requirePermission("exports:create");
    const url = new URL(request.url);
    const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";

    const dbLeads = await prisma.lead.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" }
    });

    const leads = dbLeads.map((lead): Lead => ({
      id: lead.id,
      company: lead.company,
      phone: lead.phone,
      address: lead.address ?? "",
      city: lead.cityName,
      state: lead.state,
      website: lead.website,
      instagram: lead.instagram,
      googleMapsUrl: lead.googleMaps,
      category: lead.category?.name ?? "Sem categoria",
      rating: lead.rating,
      reviewCount: lead.reviewCount,
      latitude: lead.latitude,
      longitude: lead.longitude,
      hasWhatsApp: lead.hasWhatsApp,
      status: lead.status,
      createdAt: lead.createdAt.toISOString()
    }));

    const job = await prisma.exportJob.create({
      data: {
        format: format === "csv" ? "CSV" : "XLSX",
        status: "DONE",
        fileName: `orbit-leads.${format}`,
        filters: Object.fromEntries(url.searchParams.entries())
      }
    });

    await recordAudit({
      action: "LEADS_EXPORTED",
      entity: "ExportJob",
      entityId: job.id,
      userId: user.id,
      metadata: { format, total: leads.length },
      request
    });

    if (format === "csv") {
      const csv = buildCsv(leads);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=orbit-leads.csv"
        }
      });
    }

    const workbook = buildLeadsWorkbook(leads);
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=orbit-leads.xlsx"
      }
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ error: "Nao foi possivel exportar os leads." }, { status: 500 });
  }
}
