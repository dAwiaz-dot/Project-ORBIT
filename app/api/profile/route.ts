import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sessao obrigatoria." }, { status: 401 });
  }

  const fallbackUser = {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
    role: session.user.role,
    persisted: false
  };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, role: true }
    });

    return NextResponse.json({ user: user ? { ...user, persisted: true } : fallbackUser });
  } catch {
    return NextResponse.json({ user: fallbackUser });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sessao obrigatoria." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        passwordHash: parsed.data.password ? await hash(parsed.data.password, 12) : undefined
      },
      select: { id: true, name: true, email: true, image: true, role: true }
    });

    return NextResponse.json({ user: { ...user, persisted: true } });
  } catch {
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: parsed.data.name ?? session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        role: session.user.role,
        persisted: false
      }
    });
  }
}
