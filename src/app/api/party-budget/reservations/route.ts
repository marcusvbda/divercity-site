import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
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

  let quote;
  try {
    quote = await computeQuote({ date, paymentOption });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao calcular orçamento" },
      { status: 500 }
    );
  }

  const available = await isSlotAvailable(date, dateEnd);
  if (!available) {
    return NextResponse.json(
      { error: "Data/horário indisponível — já existe uma festa confirmada neste horário" },
      { status: 409 }
    );
  }

  let stripe: Stripe;
  try {
    stripe = await getStripeClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe não configurado" },
      { status: 500 }
    );
  }

  const fieldValues: Record<string, string> = {};
  template.variables.forEach((v) => {
    fieldValues[v] = "";
  });

  const origin = req.nextUrl.origin;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const customer = await tx.customer.upsert({
          where: { cpf },
          create: { cpf, name, email: email || null, phone: phone || null },
          update: { name, email: email || null, phone: phone || null },
        });

        const party = await tx.party.create({
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
            totalPrice: quote.total,
            termsAcceptedAt: new Date(),
            paymentStatus: "pending",
          },
        });

        await tx.contract.create({
          data: {
            partyId: party.id,
            body: template.body,
            fieldValues,
            status: "draft",
          },
        });

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
          {
            price_data: {
              currency: "brl",
              product_data: { name: "Reserva de Salão de Festas — 3 horas" },
              unit_amount: Math.round(quote.salonPrice * 100),
            },
            quantity: 1,
          },
        ];

        if (paymentOption === "salon_and_passports" && quote.passportPackagePrice !== null) {
          lineItems.push({
            price_data: {
              currency: "brl",
              product_data: { name: "Pacote de 10 Passaportes" },
              unit_amount: Math.round(quote.passportPackagePrice * 100),
            },
            quantity: 1,
          });
        }

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: lineItems,
          success_url: `${origin}/orcamento/sucesso?party=${party.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/orcamento/cancelado?party=${party.id}`,
          metadata: { partyId: String(party.id) },
        });

        await tx.party.update({
          where: { id: party.id },
          data: { stripeCheckoutSessionId: session.id },
        });

        return { partyId: party.id, checkoutUrl: session.url };
      },
      { timeout: 15000 }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar reserva" },
      { status: 500 }
    );
  }
}
