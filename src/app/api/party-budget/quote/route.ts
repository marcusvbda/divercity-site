import { NextRequest, NextResponse } from "next/server";
import { computeQuote, getPartyDateEnd, isSlotAvailable } from "@/lib/party-budget";
import { PartyPaymentOptionSchema } from "@/lib/schemas/parties";

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const paymentOptionParam = req.nextUrl.searchParams.get("paymentOption");
  const passportSingleCountParam = req.nextUrl.searchParams.get("passportSingleCount");

  if (!dateParam) {
    return NextResponse.json({ error: 'Parâmetro "date" é obrigatório' }, { status: 400 });
  }

  const date = new Date(dateParam);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Parâmetro "date" inválido' }, { status: 400 });
  }

  const paymentOptionParsed = PartyPaymentOptionSchema.safeParse(paymentOptionParam);
  if (!paymentOptionParsed.success) {
    return NextResponse.json(
      { error: 'Parâmetro "paymentOption" inválido. Use "salon_only" ou "salon_and_passports"' },
      { status: 400 }
    );
  }
  const paymentOption = paymentOptionParsed.data;

  const passportSingleCount = passportSingleCountParam ? Number(passportSingleCountParam) : 0;
  if (!Number.isInteger(passportSingleCount) || passportSingleCount < 0) {
    return NextResponse.json(
      { error: 'Parâmetro "passportSingleCount" deve ser um inteiro ≥ 0' },
      { status: 400 }
    );
  }

  try {
    const dateEnd = getPartyDateEnd(date);
    const [available, quote] = await Promise.all([
      isSlotAvailable(date, dateEnd),
      computeQuote({ date, paymentOption, passportSingleCount }),
    ]);

    const breakdown = [
      { label: "Salão (3 horas)", value: quote.salonPrice },
      ...(quote.passportPackagePrice !== null
        ? [{ label: "1x pacote de 10 passaportes", value: quote.passportPackagePrice }]
        : []),
      ...(quote.passportSinglePrice !== null && (quote.passportSingleCount ?? 0) > 0
        ? [
            {
              label: `${quote.passportSingleCount}x passaporte avulso adicional`,
              value: quote.passportSinglePrice * quote.passportSingleCount!,
            },
          ]
        : []),
    ];

    return NextResponse.json({
      available,
      salonPrice: quote.salonPrice,
      passportPackagePrice: quote.passportPackagePrice,
      passportSinglePrice: quote.passportSinglePrice,
      passportSingleCount: quote.passportSingleCount,
      total: quote.total,
      breakdown,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao calcular orçamento" },
      { status: 500 }
    );
  }
}
