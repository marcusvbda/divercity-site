import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authz";
import { getOperationalOrder } from "@/lib/tickets/get-operational-order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { response } = await requireRole(["admin", "operator"]);
  if (response) return response;

  const { shortCode } = await params;
  const order = await getOperationalOrder(shortCode);
  if (!order) {
    return NextResponse.json({ error: "Compra não encontrada. Confira o código." }, { status: 404 });
  }

  return NextResponse.json(order);
}
