import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import {
  deleteDemoTeamUser,
  DEMO_TEAM_COOKIE_MAX_AGE_SECONDS,
  DEMO_TEAM_COOKIE_NAME,
  encodeDemoTeamCookie,
  hydrateDemoTeamUsersFromCookie,
  isDemoTeamError,
  updateDemoTeamUser
} from "@/services/demo/team-store";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const actor = await requirePermission("team:write");

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
    try {
      hydrateDemoTeamUsersFromCookie(request.headers.get("cookie"));
      const user = await updateDemoTeamUser(id, parsed.data);
      const response = NextResponse.json({ user });
      setDemoTeamCookie(response);
      return response;
    } catch (demoError) {
      if (isDemoTeamError(demoError)) {
        return NextResponse.json({ error: demoError.message }, { status: demoError.status });
      }

      return NextResponse.json({ error: "Nao foi possivel atualizar o usuario." }, { status: 500 });
    }
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let actorId: string | null = null;

  try {
    const actor = await requirePermission("team:write");
    actorId = actor.id;

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
    try {
      hydrateDemoTeamUsersFromCookie(request.headers.get("cookie"));
      deleteDemoTeamUser(id, actorId);
    } catch (demoError) {
      if (isDemoTeamError(demoError)) {
        return NextResponse.json({ error: demoError.message }, { status: demoError.status });
      }
    }

    const response = NextResponse.json({ ok: true });
    setDemoTeamCookie(response);
    return response;
  }
}

function setDemoTeamCookie(response: NextResponse) {
  response.cookies.set(DEMO_TEAM_COOKIE_NAME, encodeDemoTeamCookie(), {
    path: "/",
    maxAge: DEMO_TEAM_COOKIE_MAX_AGE_SECONDS,
    sameSite: "lax",
    httpOnly: true
  });
}
