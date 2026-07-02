import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    await requirePermission("audit:read");
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const pageSize = Math.min(100, Math.max(10, Number(url.searchParams.get("pageSize") ?? 25)));

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { id: true, name: true, email: true, role: true } } }
      }),
      prisma.auditLog.count()
    ]);

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
        user: log.user
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({
      logs: [
        {
          id: "demo-audit-login",
          action: "DEMO_MODE_ACTIVE",
          entity: "System",
          entityId: "local",
          metadata: { reason: "PostgreSQL local ainda nao esta rodando" },
          ipAddress: null,
          userAgent: request.headers.get("user-agent"),
          createdAt: new Date().toISOString(),
          user: { id: "development-admin-davi", name: "Davi", email: "davi@orbit.local", role: "ADMIN" }
        }
      ],
      total: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1
    });
  }
}
