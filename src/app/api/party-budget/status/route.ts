import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: 'Parâmetro "session_id" é obrigatório' }, { status: 400 });
  }

  const party = await prisma.party.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    select: { status: true, paymentStatus: true },
  });

  if (!party) {
    return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ partyStatus: party.status, paymentStatus: party.paymentStatus });
}
