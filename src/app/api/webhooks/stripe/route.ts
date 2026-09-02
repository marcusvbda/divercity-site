import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { finalizeOrderPayment } from "@/lib/tickets/finalize-payment";

async function markOrderAsFailed(orderId: string | undefined) {
  if (!orderId) return;
  const order = await prisma.ticketOrder.findUnique({ where: { id: orderId } });
  if (order && order.status === "pending_payment") {
    await prisma.ticketOrder.update({ where: { id: orderId }, data: { status: "payment_failed" } });
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  let stripe: Stripe;
  let webhookSecret: string;
  try {
    stripe = await getStripeClient();
    webhookSecret = await getStripeWebhookSecret();
  } catch (err) {
    console.error("[webhooks/stripe] Stripe não configurado:", err);
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhooks/stripe] Assinatura inválida:", err);
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId && session.payment_status === "paid") {
          await finalizeOrderPayment(orderId, session.payment_intent as string | undefined);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          await finalizeOrderPayment(orderId, session.payment_intent as string | undefined);
        }
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markOrderAsFailed(session.metadata?.orderId);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhooks/stripe] Erro ao processar evento ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}
