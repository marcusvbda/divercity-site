import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { priceOrder, TicketPricingError } from "@/lib/ticket-pricing";
import { TicketOrderCreateSchema } from "@/lib/schemas/tickets";
import { generateUniqueShortCode } from "@/lib/short-code";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = TicketOrderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  let priced;
  try {
    priced = await priceOrder(parsed.data);
  } catch (err) {
    if (err instanceof TicketPricingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const shortCode = await generateUniqueShortCode();
  const { guardianName, guardianEmail, guardianPhone, guardianWhatsapp } = parsed.data;

  // Criação sequencial (não nested create) para poder mapear com certeza cada
  // acompanhante gratuito à criança correta pelo id real, sem depender da ordem
  // em que o Prisma/Postgres devolveria um `include` após um create aninhado.
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.ticketOrder.create({
      data: {
        shortCode,
        status: "pending_payment",
        totalAmount: priced.total,
        guardianName,
        guardianEmail,
        guardianPhone,
        guardianWhatsapp,
      },
    });

    const childRecords = [];
    for (const c of priced.children) {
      const child = await tx.ticketChild.create({
        data: {
          orderId: created.id,
          name: c.name,
          birthDate: new Date(c.birthDate),
          passportTypeId: c.passportTypeId,
          isPNE: c.isPNE,
          unitPrice: c.unitPrice,
          hasCompanion: c.hasCompanion ?? null,
          unaccompaniedTermsAcceptedAt: c.unaccompaniedTermsAccepted ? new Date() : null,
        },
      });
      childRecords.push(child);
    }

    for (const companion of priced.companions) {
      await tx.ticketCompanion.create({
        data: {
          orderId: created.id,
          name: companion.name,
          phone: companion.phone,
          isFree: companion.isFree,
          linkedChildId: companion.linkedChild !== null ? childRecords[companion.linkedChild.index].id : null,
          passportTypeId: companion.passportType?.id ?? null,
          unitPrice: companion.unitPrice,
        },
      });
    }

    return created;
  });

  let stripe;
  try {
    stripe = await getStripeClient();
  } catch (err) {
    console.error("[tickets/checkout] Stripe não configurado:", err);
    return NextResponse.json(
      { error: "Pagamento indisponível no momento. Tente novamente mais tarde." },
      { status: 400 }
    );
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const child of priced.children) {
      if (child.unitPrice.isZero()) continue;
      lineItems.push({
        price_data: {
          currency: "brl",
          unit_amount: Math.round(child.unitPrice.toNumber() * 100),
          product_data: { name: `Passaporte - ${child.name}` },
        },
        quantity: 1,
      });
    }

    for (const companion of priced.companions) {
      if (companion.isFree || companion.unitPrice.isZero()) continue;
      lineItems.push({
        price_data: {
          currency: "brl",
          unit_amount: Math.round(companion.unitPrice.toNumber() * 100),
          product_data: { name: `Acompanhante - ${companion.name}` },
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "pix"],
      payment_method_options: {
        pix: { expires_after_seconds: 3600 },
      },
      currency: "brl",
      line_items: lineItems,
      customer_email: order.guardianEmail,
      success_url: `${appUrl}/compra-antecipada/confirmacao/${shortCode}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/compra-antecipada`,
      metadata: { orderId: order.id },
    });

    await prisma.ticketOrder.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.json({ checkoutUrl: session.url, shortCode });
  } catch (err) {
    console.error("[tickets/checkout] Falha ao criar sessão de pagamento:", err);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
