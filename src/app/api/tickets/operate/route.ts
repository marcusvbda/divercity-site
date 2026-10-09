import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { Prisma, TicketOrderStatus, TicketPassStatus } from "@/generated/prisma/client";

const ALLOWED_PAYMENT: TicketOrderStatus[] = ["pending_payment", "paid", "payment_failed", "cancelled"];
const ALLOWED_TICKET_STATUS: TicketPassStatus[] = ["not_used", "checked_in", "checked_out"];

const ALLOWED_SORT: Record<string, boolean> = {
  createdAt: true,
  guardianName: true,
  status: true,
  totalAmount: true,
};

export async function GET(req: NextRequest) {
  const { response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, Math.floor(Number(params.get("page") ?? "1")) || 1);
  const perPage = Math.min(Math.max(1, Math.floor(Number(params.get("perPage") ?? "15")) || 15), 100);
  const search = (params.get("search") ?? "").trim();
  const paymentParam = params.get("payment") ?? "";
  const ticketStatusParam = params.get("ticketStatus") ?? "";
  const sort = params.get("sort") ?? "createdAt";
  const dir = params.get("dir") === "asc" ? "asc" : "desc";

  const payment = ALLOWED_PAYMENT.includes(paymentParam as TicketOrderStatus)
    ? (paymentParam as TicketOrderStatus)
    : undefined;
  const ticketStatus = ALLOWED_TICKET_STATUS.includes(ticketStatusParam as TicketPassStatus)
    ? (ticketStatusParam as TicketPassStatus)
    : undefined;

  const where: Prisma.TicketOrderWhereInput = {
    ...(payment ? { status: payment } : {}),
    ...(ticketStatus ? { passes: { some: { status: ticketStatus } } } : {}),
    ...(search
      ? {
          OR: [
            { shortCode: { contains: search, mode: "insensitive" } },
            { guardianName: { contains: search, mode: "insensitive" } },
            { guardianEmail: { contains: search, mode: "insensitive" } },
            { guardianPhone: { contains: search, mode: "insensitive" } },
            { passes: { some: { shortCode: { contains: search, mode: "insensitive" } } } },
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
        passes: {
          orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
          select: {
            shortCode: true,
            kind: true,
            status: true,
            contractedDurationMinutes: true,
            checkedInAt: true,
            checkedOutAt: true,
            overtimeMinutes: true,
            child: { select: { name: true } },
            companion: { select: { name: true } },
          },
        },
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
      ticketsCount: o.passes.length,
      createdAt: o.createdAt.toISOString(),
      tickets: o.passes.map((p) => ({
        shortCode: p.shortCode,
        kind: p.kind,
        holderName: p.child?.name ?? p.companion?.name ?? "",
        status: p.status,
        contractedDurationMinutes: p.contractedDurationMinutes,
        checkedInAt: p.checkedInAt?.toISOString() ?? null,
        checkedOutAt: p.checkedOutAt?.toISOString() ?? null,
        plannedEndAt: p.checkedInAt
          ? new Date(p.checkedInAt.getTime() + p.contractedDurationMinutes * 60000).toISOString()
          : null,
        overtimeMinutes: p.overtimeMinutes,
      })),
    })),
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
}
