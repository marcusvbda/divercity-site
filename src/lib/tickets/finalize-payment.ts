import { prisma } from "@/lib/prisma";
import { getContractedDurationMinutes } from "@/lib/ticket-pricing";
import { sendTicketConfirmationEmail } from "@/lib/email/send-ticket-confirmation";

/**
 * Ponto único de confirmação de pagamento (spec seção 7): marca o pedido como
 * pago, calcula a duração contratada e dispara o e-mail com QR Code/código curto.
 * Idempotente — o webhook do Stripe pode reentregar o mesmo evento mais de uma vez.
 */
export async function finalizeOrderPayment(orderId: string, stripePaymentIntentId?: string): Promise<void> {
  const order = await prisma.ticketOrder.findUnique({
    where: { id: orderId },
    include: { children: { include: { passportType: true } } },
  });
  if (!order) throw new Error(`Pedido ${orderId} não encontrado`);

  if (order.status !== "pending_payment" && order.status !== "payment_failed") {
    return;
  }

  const contractedDurationMinutes = getContractedDurationMinutes(order.children);

  // Update condicionado ao status atual no WHERE — atômico no banco. Se o Stripe
  // reentregar eventos em paralelo (ex: completed + async_payment_succeeded),
  // só uma chamada consegue transicionar o pedido e disparar o e-mail.
  const result = await prisma.ticketOrder.updateMany({
    where: { id: orderId, status: order.status },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: stripePaymentIntentId ?? order.stripePaymentIntentId,
      contractedDurationMinutes,
    },
  });
  if (result.count === 0) return;

  await sendTicketConfirmationEmail(orderId);
}
