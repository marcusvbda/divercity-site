import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { Prisma, TicketOrderStatus } from "@/generated/prisma/client";

const ALLOWED_STATUS: TicketOrderStatus[] = [
  "pending_payment",
  "paid",
  "payment_failed",
  "cancelled",
  "checked_in",
  "checked_out",
];

const ALLOWED_SORT: Record<string, boolean> = {
  createdAt: true,
  guardianName: true,
  status: true,
  totalAmount: true,
};

/**
 * Listagem de compras para o operador localizar manualmente quando não tem o
 * código curto nem o QR Code em mãos (spec seção 11 — "Consulta de ingresso/compra").
 */
export async function GET(req: NextRequest) {
  const { response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
  const perPage = Math.min(Number(req.nextUrl.searchParams.get("perPage") ?? "15"), 100);
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const statusParam = req.nextUrl.searchParams.get("status") ?? "";
  const sort = req.nextUrl.searchParams.get("sort") ?? "createdAt";
  const dir = (req.nextUrl.searchParams.get("dir") ?? "desc") as "asc" | "desc";

  const status = ALLOWED_STATUS.includes(statusParam as TicketOrderStatus)
    ? (statusParam as TicketOrderStatus)
    : undefined;

  const where: Prisma.TicketOrderWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { shortCode: { contains: search, mode: "insensitive" } },
            { guardianName: { contains: search, mode: "insensitive" } },
            { guardianEmail: { contains: search, mode: "insensitive" } },
            { guardianPhone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy = ALLOWED_SORT[sort] ? { [sort]: dir } : ({ createdAt: "desc" } as const);

  const [rows, total] = await Promise.all([
    prisma.ticketOrder.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        shortCode: true,
        status: true,
        guardianName: true,
        guardianPhone: true,
        totalAmount: true,
        createdAt: true,
        checkedInAt: true,
        checkedOutAt: true,
        _count: { select: { children: true } },
      },
    }),
    prisma.ticketOrder.count({ where }),
  ]);

  return NextResponse.json({
    data: rows.map((o) => ({
      id: o.id,
      shortCode: o.shortCode,
      status: o.status,
      guardianName: o.guardianName,
      guardianPhone: o.guardianPhone,
      totalAmount: o.totalAmount.toFixed(2),
      childrenCount: o._count.children,
      createdAt: o.createdAt.toISOString(),
      checkedInAt: o.checkedInAt?.toISOString() ?? null,
      checkedOutAt: o.checkedOutAt?.toISOString() ?? null,
    })),
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
}
