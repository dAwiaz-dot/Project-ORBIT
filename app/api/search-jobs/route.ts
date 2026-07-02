import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import {
  createDemoSearchJob,
  decodeDemoSearchCookie,
  encodeDemoSearchCookie,
  getDemoSearchJobFromFilters,
  listDemoSearchJobs
} from "@/services/demo/demo-store";
import { recordAudit } from "@/services/audit/audit.service";
import { createSearchJob, processSearchJob, searchJobSchema, toSearchJobDto } from "@/services/search-jobs/search-job.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
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
    const jobs = listDemoSearchJobs();
    const demoFilters = decodeDemoSearchCookie(getCookieValue(request.headers.get("cookie"), "orbit_demo_search"));
    return NextResponse.json({ jobs: jobs.length ? jobs : demoFilters ? [getDemoSearchJobFromFilters("demo-last-search", demoFilters)] : [] });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = searchJobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Filtros invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await requirePermission("searchJobs:create");
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
    const job = createDemoSearchJob(parsed.data, { id: "development-admin-davi", name: "Davi", email: "davi@orbit.local" });
    const response = NextResponse.json({ job }, { status: 202 });
    response.cookies.set("orbit_demo_search", encodeDemoSearchCookie(parsed.data), {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax"
    });
    return response;
  }
}

function getCookieValue(header: string | null, name: string) {
  return header
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
