import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import { createSearchJob, processSearchJob, searchJobSchema, toSearchJobDto } from "@/services/search-jobs/search-job.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requirePermission("searchJobs:read");

    const jobs = await prisma.searchJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json({ jobs: jobs.map(toSearchJobDto) });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ jobs: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission("searchJobs:create");
    const body = await request.json();
    const parsed = searchJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Filtros invalidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const job = await createSearchJob(parsed.data, user.id);
    await recordAudit({
      action: "SEARCH_JOB_CREATED",
      entity: "SearchJob",
      entityId: job.id,
      userId: user.id,
      metadata: parsed.data,
      request
    });

    void processSearchJob(job.id);

    return NextResponse.json({ job: toSearchJobDto(job) }, { status: 202 });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const body = await request.json().catch(() => ({}));
    const now = new Date().toISOString();
    return NextResponse.json(
      {
        job: {
          id: `demo-job-${Date.now()}`,
          status: "SUCCEEDED",
          state: body.state ?? "MG",
          city: body.city ?? "Pouso Alegre",
          category: body.category ?? "Dentistas",
          maxResults: Number(body.maxResults ?? 50),
          minRating: Number(body.minRating ?? 0),
          minReviews: Number(body.minReviews ?? 0),
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
      },
      { status: 202 }
    );
  }
}
