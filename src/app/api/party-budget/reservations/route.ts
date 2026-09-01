import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PartyBudgetReservationSchema } from "@/lib/schemas/parties";
import { computeQuote, getPartyDateEnd, isSlotAvailable } from "@/lib/party-budget";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = PartyBudgetReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    cpf,
    name,
    email,
    phone,
    date: dateStr,
    childrenCount,
    adultsCount,
    totalParticipants,
    paymentOption,
    passportSingleCount,
  } = parsed.data;

  const date = new Date(dateStr);
  const dateEnd = getPartyDateEnd(date);

  const template = await prisma.contractTemplate.findFirst({ where: { isDefault: true } });
  if (!template) {
    return NextResponse.json(
      {
        error:
          "Nenhum modelo de contrato padrão configurado. Um administrador precisa marcar um modelo como padrão em /admin/contract-templates.",
      },
      { status: 500 }
    );
  }

  const available = await isSlotAvailable(date, dateEnd);
  if (!available) {
    return NextResponse.json(
      { error: "Data/horário indisponível — já existe uma festa agendada neste horário" },
      { status: 409 }
    );
  }

  let quote;
  try {
    quote = await computeQuote({ date, paymentOption, passportSingleCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao calcular orçamento" },
      { status: 500 }
    );
  }

  const fieldValues: Record<string, string> = {};
  template.variables.forEach((v) => {
    fieldValues[v] = "";
  });

  try {
    const party = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { cpf },
        create: { cpf, name, email: email || null, phone: phone || null },
        update: { name, email: email || null, phone: phone || null },
      });

      const newParty = await tx.party.create({
        data: {
          customerId: customer.id,
          contractTemplateId: template.id,
          date,
          dateEnd,
          status: "pending",
          childrenCount,
          adultsCount,
          totalParticipants,
          paymentOption,
          salonPrice: quote.salonPrice,
          passportPackagePrice: quote.passportPackagePrice,
          passportSinglePrice: quote.passportSinglePrice,
          passportSingleCount: quote.passportSingleCount,
          totalPrice: quote.total,
          termsAcceptedAt: new Date(),
        },
      });

      await tx.contract.create({
        data: {
          partyId: newParty.id,
          body: template.body,
          fieldValues,
          status: "draft",
        },
      });

      return newParty;
    });

    return NextResponse.json({ partyId: party.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar reserva" },
      { status: 500 }
    );
  }
}
