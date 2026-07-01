import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sulMinasCities } from "@/data/sul-minas-cities";

const citySchema = z.object({
  name: z.string().min(2).max(100),
  state: z.string().length(2),
  region: z.string().optional()
});

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { active: true },
      orderBy: [{ state: "asc" }, { name: "asc" }]
    });
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json(sulMinasCities.map((name) => ({ id: `${name}-MG`, name, state: "MG", region: "Sul de Minas" })));
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = citySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Cidade invalida" }, { status: 400 });
  }

  const city = await prisma.city.upsert({
    where: { name_state: { name: parsed.data.name, state: parsed.data.state.toUpperCase() } },
    update: { active: true, region: parsed.data.region },
    create: {
      name: parsed.data.name,
      state: parsed.data.state.toUpperCase(),
      region: parsed.data.region
    }
  });

  return NextResponse.json(city, { status: 201 });
}
