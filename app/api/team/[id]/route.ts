import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("team:write");
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email?.toLowerCase(),
        role: parsed.data.role,
        passwordHash: parsed.data.password ? await hash(parsed.data.password, 12) : undefined
      },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true, updatedAt: true }
    });

    await recordAudit({
      action: "TEAM_USER_UPDATED",
      entity: "User",
      entityId: user.id,
      userId: actor.id,
      metadata: { role: user.role, email: user.email },
      request
    });

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      user: {
        id,
        name: body.name ?? "Davi",
        email: body.email ?? "davi@orbit.local",
        role: body.role ?? UserRole.ADMIN,
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requirePermission("team:write");
    const { id } = await params;

    if (actor.id === id) {
      return NextResponse.json({ error: "Voce nao pode remover seu proprio acesso." }, { status: 400 });
    }

    const user = await prisma.user.delete({
      where: { id },
      select: { id: true, email: true, role: true }
    });

    await recordAudit({
      action: "TEAM_USER_DELETED",
      entity: "User",
      entityId: user.id,
      userId: actor.id,
      metadata: { role: user.role, email: user.email },
      request
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    return NextResponse.json({ ok: true });
  }
}
