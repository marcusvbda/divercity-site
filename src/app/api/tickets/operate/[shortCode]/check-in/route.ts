import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import {
  findOperationalTicketRecord,
  normalizeShortCode,
  operationalTicketInclude,
  serializeOperationalTicket,
} from "@/lib/tickets/get-operational-ticket";

const UNPAID_MESSAGES: Record<string, string> = {
  pending_payment: "A compra deste ticket ainda não foi paga.",
  payment_failed: "A compra deste ticket ainda não foi paga.",
  cancelled: "A compra deste ticket foi cancelada.",
};

const PASS_STATUS_MESSAGES: Record<string, string> = {
  checked_in: "Check-in já realizado para este ticket.",
  checked_out: "Este ticket já foi finalizado (check-out já realizado).",
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { session, response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const { shortCode } = await params;
  const normalized = normalizeShortCode(shortCode);

  const pass = await findOperationalTicketRecord(shortCode);
  if (!pass) {
    return NextResponse.json({ error: "Ticket não encontrado. Confira o código." }, { status: 404 });
  }

  const result = await prisma.ticketPass.updateMany({
    where: { shortCode: normalized, status: "not_used", order: { status: "paid" } },
    data: {
      status: "checked_in",
      checkedInAt: new Date(),
      checkedInById: session.user.id,
    },
  });

  if (result.count === 0) {
    const current = await prisma.ticketPass.findUnique({
      where: { shortCode: normalized },
      select: { status: true, order: { select: { status: true } } },
    });
    const message =
      (current && current.order.status !== "paid" && UNPAID_MESSAGES[current.order.status]) ||
      (current && PASS_STATUS_MESSAGES[current.status]) ||
      "Este ticket não pode receber check-in.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const updated = await prisma.ticketPass.findUniqueOrThrow({
    where: { shortCode: normalized },
    include: operationalTicketInclude,
  });

  return NextResponse.json(serializeOperationalTicket(updated));
}
