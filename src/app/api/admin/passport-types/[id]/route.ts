import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
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

  const existing = await prisma.passportType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.key) {
    if (parsed.data.active === false) {
      return NextResponse.json({ error: "Passaporte fixo não pode ser desativado." }, { status: 400 });
    }
    if (parsed.data.durationMinutes !== existing.durationMinutes) {
      return NextResponse.json(
        { error: "A duração de um passaporte fixo não pode ser alterada." },
        { status: 400 }
      );
    }
  }

  const passportType = await prisma.passportType.update({ where: { id }, data: parsed.data });
  revalidateTag("passport-types", "max");
  return NextResponse.json(passportType);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.passportType.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.key) {
    return NextResponse.json(
      { error: "Este passaporte é fixo do sistema e não pode ser removido, apenas editado." },
      { status: 403 }
    );
  }

  const inUse = await prisma.ticketChild.findFirst({ where: { passportTypeId: id } });
  if (inUse) {
    return NextResponse.json(
      { error: "Este tipo de passaporte já foi usado em compras e não pode ser removido. Desative-o em vez disso." },
      { status: 403 }
    );
  }

  await prisma.passportType.delete({ where: { id } });
  revalidateTag("passport-types", "max");
  return NextResponse.json({ success: true });
}
