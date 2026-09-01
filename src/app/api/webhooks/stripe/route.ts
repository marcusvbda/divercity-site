import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  const webhookSecret = await getStripeWebhookSecret();
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook do Stripe não configurado" }, { status: 400 });
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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Assinatura inválida: ${err instanceof Error ? err.message : "erro"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    await prisma.party.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: {
        paymentStatus: "paid",
        paidAt: new Date(),
        stripePaymentIntentId: paymentIntentId,
      },
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.party.updateMany({
      where: { stripeCheckoutSessionId: session.id },
      data: { paymentStatus: "failed" },
    });
  }

  return NextResponse.json({ received: true });
}
