import { NextRequest, NextResponse } from "next/server";
import { isFeatureEnabled } from "@/lib/features";
import { getPartyDateEnd, isSlotAvailable } from "@/lib/party-budget";

export async function GET(req: NextRequest) {
  if (!(await isFeatureEnabled("party_budget"))) {
    return NextResponse.json(
      { error: "Orçamento de festa indisponível no momento." },
      { status: 403 }
    );
  }

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
