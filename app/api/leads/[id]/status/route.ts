import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const statusSchema = z.object({
  status: z.enum(["NEW", "SENT", "REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "CLIENT", "LOST"])
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Status invalido" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { status: parsed.data.status }
  });

  return NextResponse.json(lead);
}
