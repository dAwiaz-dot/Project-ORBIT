import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  action: string;
  entity: string;
  entityId?: string | null;
  userId?: string | null;
  leadId?: string | null;
  metadata?: Prisma.InputJsonValue;
  request?: Request;
};

export async function recordAudit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        userId: input.userId,
        leadId: input.leadId,
        metadata: input.metadata,
        ipAddress: getClientIp(input.request),
        userAgent: input.request?.headers.get("user-agent") ?? null
      }
    });
  } catch (error) {
    console.error("Falha ao registrar auditoria", error);
  }
}

function getClientIp(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request?.headers.get("x-real-ip") ?? null;
}
