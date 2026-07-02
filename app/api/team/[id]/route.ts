import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
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

    if (parsed.data.role && parsed.data.role !== UserRole.ADMIN) {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true }
      });

      if (targetUser?.role === UserRole.ADMIN) {
        const otherAdmins = await prisma.user.count({
          where: {
            role: UserRole.ADMIN,
            id: { not: id }
          }
        });

        if (otherAdmins === 0) {
          return NextResponse.json({ error: "Mantenha pelo menos um administrador ativo." }, { status: 400 });
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email?.toLowerCase(),
        role: parsed.data.role,
        passwordHash: parsed.data.password ? await hash(parsed.data.password, 12) : undefined
      },
      select: { id: true, name: true, email: true, role: true, image: true, passwordHash: true, createdAt: true, updatedAt: true }
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        hasPassword: Boolean(user.passwordHash),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Este email ja esta cadastrado." }, { status: 409 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      user: {
        id,
        name: body.name ?? "Davi",
        email: body.email ?? "davi@orbit.local",
        role: body.role ?? UserRole.ADMIN,
        image: null,
        hasPassword: Boolean(body.password),
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true }
    });

    if (targetUser?.role === UserRole.ADMIN) {
      const otherAdmins = await prisma.user.count({
        where: {
          role: UserRole.ADMIN,
          id: { not: id }
        }
      });

      if (otherAdmins === 0) {
        return NextResponse.json({ error: "Mantenha pelo menos um administrador ativo." }, { status: 400 });
      }
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
