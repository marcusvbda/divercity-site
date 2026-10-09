import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import {
  findOperationalTicketRecord,
  normalizeShortCode,
  operationalTicketInclude,
  serializeOperationalTicket,
} from "@/lib/tickets/get-operational-ticket";

const PASS_STATUS_MESSAGES: Record<string, string> = {
  not_used: "Nenhum check-in em andamento para este ticket.",
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

  if (pass.status !== "checked_in" || !pass.checkedInAt) {
    const message = PASS_STATUS_MESSAGES[pass.status] ?? "Este ticket não pode receber check-out.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const checkedOutAt = new Date();
  const elapsedMinutes = Math.round((checkedOutAt.getTime() - pass.checkedInAt.getTime()) / 60000);
  const overtimeMinutes = Math.max(0, elapsedMinutes - pass.contractedDurationMinutes);

  const result = await prisma.ticketPass.updateMany({
    where: { shortCode: normalized, status: "checked_in" },
    data: {
      status: "checked_out",
      checkedOutAt,
      checkedOutById: session.user.id,
      overtimeMinutes,
    },
  });

  if (result.count === 0) {
    const current = await prisma.ticketPass.findUnique({
      where: { shortCode: normalized },
      select: { status: true },
    });
    const message = (current && PASS_STATUS_MESSAGES[current.status]) ?? "Este ticket não pode receber check-out.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const updated = await prisma.ticketPass.findUniqueOrThrow({
    where: { shortCode: normalized },
    include: operationalTicketInclude,
  });

  return NextResponse.json(serializeOperationalTicket(updated));
}
