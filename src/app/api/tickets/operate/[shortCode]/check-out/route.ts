import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import {
  findOperationalOrderRecord,
  normalizeShortCode,
  operationalOrderInclude,
  serializeOperationalOrder,
} from "@/lib/tickets/get-operational-order";

const INVALID_STATUS_MESSAGES: Record<string, string> = {
  pending_payment: "Esta compra ainda não foi paga — não há check-in em andamento.",
  payment_failed: "Esta compra ainda não foi paga — não há check-in em andamento.",
  cancelled: "Esta compra foi cancelada.",
  paid: "Nenhum check-in em andamento para esta compra.",
  checked_out: "Esta compra já foi finalizada (check-out já realizado).",
};

export async function POST(_req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { session, response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const { shortCode } = await params;
  const normalized = normalizeShortCode(shortCode);

  const order = await findOperationalOrderRecord(shortCode);
  if (!order) {
    return NextResponse.json({ error: "Compra não encontrada. Confira o código." }, { status: 404 });
  }

  if (order.status !== "checked_in" || !order.checkedInAt) {
    const message = INVALID_STATUS_MESSAGES[order.status] ?? "Esta compra não pode receber check-out.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const checkedOutAt = new Date();
  const elapsedMinutes = Math.round((checkedOutAt.getTime() - order.checkedInAt.getTime()) / 60000);
  const overtimeMinutes = Math.max(0, elapsedMinutes - (order.contractedDurationMinutes ?? 0));

  // Update condicionado ao status atual no WHERE — atômico no banco, evita que
  // duas requisições concorrentes ambas processem o check-out.
  const result = await prisma.ticketOrder.updateMany({
    where: { shortCode: normalized, status: "checked_in" },
    data: {
      status: "checked_out",
      checkedOutAt,
      checkedOutById: session.user.id,
      overtimeMinutes,
    },
  });

  if (result.count === 0) {
    const current = await prisma.ticketOrder.findUnique({ where: { shortCode: normalized } });
    const message =
      (current && INVALID_STATUS_MESSAGES[current.status]) ?? "Esta compra não pode receber check-out.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const updated = await prisma.ticketOrder.findUniqueOrThrow({
    where: { shortCode: normalized },
    include: operationalOrderInclude,
  });

  return NextResponse.json(serializeOperationalOrder(updated));
}
