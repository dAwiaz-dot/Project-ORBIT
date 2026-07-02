import { POST as createSearchJob } from "@/app/api/search-jobs/route";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return createSearchJob(request);
}
