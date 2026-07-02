import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { initialCategories } from "@/data/categories";

const categorySchema = z.object({
  name: z.string().min(2).max(80)
});

export async function GET() {
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
