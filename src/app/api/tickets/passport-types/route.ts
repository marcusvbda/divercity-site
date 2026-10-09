import { NextResponse } from "next/server";
import { getActivePassportTypes } from "@/lib/passport-types";

/** Lista pública dos tipos de passaporte ativos, para o seletor da compra antecipada. */
export async function GET() {
  const data = await getActivePassportTypes();
  return NextResponse.json({ data });
}
