import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketQrCodeDataUrl } from "@/lib/ticket-qrcode";
import { getStripeClient } from "@/lib/stripe";
import { finalizeOrderPayment } from "@/lib/tickets/finalize-payment";

async function syncPaymentWithStripe(order: { id: string; stripeCheckoutSessionId: string | null }) {
  if (!order.stripeCheckoutSessionId) return;
  try {
    const stripe = await getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);
    if (session.payment_status === "paid") {
      await finalizeOrderPayment(order.id, session.payment_intent as string | undefined);
    }
  } catch (err) {
    console.error("[tickets/confirmation] Falha ao sincronizar pagamento com o Stripe:", err);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  const findOrder = () =>
    prisma.ticketOrder.findUnique({
      where: { shortCode: shortCode.trim().toUpperCase() },
      include: {
        children: { include: { passportType: true, companion: true } },
        companions: true,
      },
    });

  let order = await findOrder();

  if (order?.status === "pending_payment") {
    await syncPaymentWithStripe(order);
    order = await findOrder();
  }

  if (!order) {
    return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 });
  }

  if (order.status === "pending_payment" || order.status === "payment_failed") {
    return NextResponse.json({ status: order.status });
  }

  const qrCodeDataUrl = await generateTicketQrCodeDataUrl(order.shortCode);

  return NextResponse.json({
    status: order.status,
    shortCode: order.shortCode,
    guardianName: order.guardianName,
    guardianPhone: order.guardianPhone,
    guardianWhatsapp: order.guardianWhatsapp,
    totalAmount: order.totalAmount.toFixed(2),
    contractedDurationMinutes: order.contractedDurationMinutes,
    qrCodeDataUrl,
    children: order.children.map((c) => ({
      name: c.name,
      passportTypeName: c.passportType.name,
      isPNE: c.isPNE,
      unitPrice: c.unitPrice.toFixed(2),
      hasCompanion: c.hasCompanion,
      companionName: c.companion?.name ?? null,
      unaccompanied: c.hasCompanion === false,
    })),
    companions: order.companions
      .filter((c) => !c.linkedChildId)
      .map((c) => ({
        name: c.name,
        isFree: c.isFree,
        unitPrice: c.unitPrice.toFixed(2),
      })),
  });
}
