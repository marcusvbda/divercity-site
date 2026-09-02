import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { PassportTypeSchema } from "@/lib/schemas/tickets";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const { id } = await params;
  const passportType = await prisma.passportType.findUnique({ where: { id } });
  if (!passportType) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(passportType);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = PassportTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passportType = await prisma.passportType.update({ where: { id }, data: parsed.data });
  return NextResponse.json(passportType);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const { id } = await params;
  const inUse = await prisma.ticketChild.findFirst({ where: { passportTypeId: id } });
  if (inUse) {
    return NextResponse.json(
      { error: "Este tipo de passaporte já foi usado em compras e não pode ser removido. Desative-o em vez disso." },
      { status: 403 }
    );
  }

  await prisma.passportType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
