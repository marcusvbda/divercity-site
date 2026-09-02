import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { PassportTypeSchema } from "@/lib/schemas/tickets";

export async function GET(req: NextRequest) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const perPage = Math.min(Number(req.nextUrl.searchParams.get("perPage") ?? "50"), 100);
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : undefined;

  const [data, total] = await Promise.all([
    prisma.passportType.findMany({
      where,
      orderBy: [{ sort: "asc" }, { durationMinutes: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.passportType.count({ where }),
  ]);

  return NextResponse.json({
    data,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
}

export async function POST(req: NextRequest) {
  const { response } = await requireRole(["admin"]);
  if (response) return response;

  const body = await req.json();
  const parsed = PassportTypeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const passportType = await prisma.passportType.create({ data: parsed.data });
  return NextResponse.json(passportType, { status: 201 });
}
