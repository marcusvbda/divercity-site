import { NextRequest, NextResponse } from "next/server";
import { TicketQuoteRequestSchema } from "@/lib/schemas/tickets";
import { priceOrder, TicketPricingError } from "@/lib/ticket-pricing";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TicketQuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await priceOrder(parsed.data);
    return NextResponse.json({
      children: result.children.map((c) => ({
        name: c.name,
        passportTypeId: c.passportTypeId,
        passportTypeName: c.passportType.name,
        ageMonths: c.ageMonths,
        isPNE: c.isPNE,
        hasCompanion: c.hasCompanion ?? null,
        unitPrice: c.unitPrice.toFixed(2),
      })),
      companions: result.companions.map((c) => ({
        name: c.name,
        isFree: c.isFree,
        passportTypeName: c.passportType?.name ?? null,
        unitPrice: c.unitPrice.toFixed(2),
      })),
      total: result.total.toFixed(2),
    });
  } catch (err) {
    if (err instanceof TicketPricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
