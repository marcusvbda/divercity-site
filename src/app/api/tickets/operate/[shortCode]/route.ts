import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { getOperationalTicket } from "@/lib/tickets/get-operational-ticket";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const { shortCode } = await params;
  const ticket = await getOperationalTicket(shortCode);
  if (!ticket) {
    return NextResponse.json({ error: "Ticket não encontrado. Confira o código." }, { status: 404 });
  }

  return NextResponse.json(ticket);
}
