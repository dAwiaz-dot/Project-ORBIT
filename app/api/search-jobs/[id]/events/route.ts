import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { toSearchJobDto } from "@/services/search-jobs/search-job.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const terminalStatuses = new Set(["SUCCEEDED", "FAILED", "CANCELLED"]);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission("searchJobs:read");
    const { id } = await params;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        request.signal.addEventListener("abort", () => {
          closed = true;
          try {
            controller.close();
          } catch {
            // A conexao pode ja ter sido encerrada pelo navegador.
          }
        });

        while (!closed) {
          const job = await prisma.searchJob.findUnique({
            where: { id },
            include: { user: { select: { id: true, name: true, email: true } } }
          });

          if (!job) {
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: "Busca nao encontrada." })}\n\n`));
            break;
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(toSearchJobDto(job))}\n\n`));
          if (terminalStatuses.has(job.status)) break;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        try {
          controller.close();
        } catch {
          // O cliente pode fechar antes do servidor.
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const { id } = await params;
    const now = new Date().toISOString();
    const demoJob = {
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
    };

    return new Response(`data: ${JSON.stringify(demoJob)}\n\n`, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  }
}
