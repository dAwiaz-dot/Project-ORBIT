import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRbacError, rbacErrorResponse, requirePermission } from "@/lib/rbac";
import { initialCategories } from "@/data/categories";

const categorySchema = z.object({
  name: z.string().min(2).max(80)
});

export async function GET() {
  try {
    await requirePermission("leads:read");
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }

  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(initialCategories.map((name) => ({ id: name, name, active: true })));
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission("settings:write");
  } catch (error) {
    if (isRbacError(error)) return rbacErrorResponse(error);
    throw error;
  }

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Categoria invalida" }, { status: 400 });
  }

  try {
    const category = await prisma.category.upsert({
      where: { name: parsed.data.name },
      update: { active: true },
      create: { name: parsed.data.name }
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ id: parsed.data.name, name: parsed.data.name, active: true }, { status: 201 });
  }
}
