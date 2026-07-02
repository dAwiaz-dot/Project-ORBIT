import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { recordAudit } from "@/services/audit/audit.service";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole)
});

const demoUsers = [
  {
    id: "development-admin-davi",
    name: "Davi",
    email: "davi@orbit.local",
    role: UserRole.ADMIN,
    image: null,
    hasPassword: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
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
    return NextResponse.json({ users: demoUsers });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("team:write");
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
    }

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

    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        user: {
          id: `demo-${Date.now()}`,
          name: body.name ?? "Usuario demo",
          email: body.email ?? "demo@orbit.local",
          role: body.role ?? UserRole.SELLER,
          image: null,
          hasPassword: Boolean(body.password),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  }
}
