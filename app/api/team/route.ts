import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";
import {
  createDemoTeamUser,
  DEMO_TEAM_COOKIE_MAX_AGE_SECONDS,
  DEMO_TEAM_COOKIE_NAME,
  encodeDemoTeamCookie,
  hydrateDemoTeamUsersFromCookie,
  isDemoTeamError,
  listDemoTeamUsers
} from "@/services/demo/team-store";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole)
});

export async function GET(request: Request) {
  try {
    await requirePermission("team:read");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        hasPassword: Boolean(user.passwordHash),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    hydrateDemoTeamUsersFromCookie(request.headers.get("cookie"));
    return NextResponse.json({ users: listDemoTeamUsers() });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const actor = await requirePermission("team:write");

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hash(parsed.data.password, 12),
        role: parsed.data.role
      },
      select: { id: true, name: true, email: true, role: true, image: true, passwordHash: true, createdAt: true, updatedAt: true }
    });

    await recordAudit({
      action: "TEAM_USER_CREATED",
      entity: "User",
      entityId: user.id,
      userId: actor.id,
      metadata: { role: user.role, email: user.email },
      request
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Este email ja esta cadastrado." }, { status: 409 });
    }
    try {
      hydrateDemoTeamUsersFromCookie(request.headers.get("cookie"));
      const user = await createDemoTeamUser(parsed.data);
      const response = NextResponse.json({ user }, { status: 201 });
      setDemoTeamCookie(response);
      return response;
    } catch (demoError) {
      if (isDemoTeamError(demoError)) {
        return NextResponse.json({ error: demoError.message }, { status: demoError.status });
      }

      return NextResponse.json({ error: "Nao foi possivel criar o perfil de acesso." }, { status: 500 });
    }
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
