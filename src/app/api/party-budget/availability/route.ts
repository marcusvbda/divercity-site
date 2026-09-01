import { NextRequest, NextResponse } from "next/server";
import { getPartyDateEnd, isSlotAvailable } from "@/lib/party-budget";

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: 'Parâmetro "date" é obrigatório' }, { status: 400 });
  }

  const date = new Date(dateParam);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Parâmetro "date" inválido' }, { status: 400 });
  }

  const available = await isSlotAvailable(date, getPartyDateEnd(date));
  return NextResponse.json({ available });
}
