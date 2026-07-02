import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { toSearchJobDto } from "@/services/search-jobs/search-job.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("searchJobs:read");
    const { id } = await params;
    const job = await prisma.searchJob.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!job) {
      return NextResponse.json({ error: "Busca nao encontrada." }, { status: 404 });
    }

    return NextResponse.json({ job: toSearchJobDto(job) });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const { id } = await params;
    const now = new Date().toISOString();
    return NextResponse.json({
      job: {
        id,
        status: "SUCCEEDED",
        state: "MG",
        city: "Pouso Alegre",
        category: "Dentistas",
        maxResults: 50,
        minRating: 0,
        minReviews: 0,
        progress: 100,
        message: "Modo demonstracao: conecte PostgreSQL e Apify para executar a busca real.",
        resultCount: 0,
        duplicateCount: 0,
        error: null,
        startedAt: now,
        completedAt: now,
        createdAt: now,
        updatedAt: now,
        user: { id: "development-admin-davi", name: "Davi", email: "davi@orbit.local" }
      }
    });
  }
}
