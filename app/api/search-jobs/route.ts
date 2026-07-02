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
    return NextResponse.json({ error: "Nao foi possivel carregar a fila." }, { status: 500 });
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
    return NextResponse.json({ error: "Nao foi possivel criar a busca." }, { status: 500 });
  }
}
