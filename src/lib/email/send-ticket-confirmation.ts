import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateTicketQrCodeDataUrl } from "@/lib/ticket-qrcode";

const currency = (value: unknown) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function buildEmailHtml(params: {
  guardianName: string;
  guardianPhone: string;
  guardianWhatsapp: string;
  shortCode: string;
  totalAmount: string;
  contractedDurationMinutes: number | null;
  confirmationUrl: string;
  qrCodeCid: string;
  children: {
    name: string;
    passportTypeName: string;
    unitPrice: string;
    isPNE: boolean;
    hasCompanion: boolean | null;
    companionName: string | null;
    unaccompanied: boolean;
  }[];
  companions: { name: string; isFree: boolean; unitPrice: string }[];
}) {
  const childRows = params.children
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          ${c.name}${c.isPNE ? " <span style=\"color:#888;font-size:12px;\">(PNE)</span>" : ""}
          <br/><span style="color:#888;font-size:12px;">${c.passportTypeName}</span>
          ${c.hasCompanion === true ? `<br/><span style="color:#888;font-size:12px;">Acompanhante: ${c.companionName ?? ""} (gratuito — comprovar +18 anos na entrada)</span>` : ""}
          ${c.unaccompanied ? `<br/><span style="color:#c0392b;font-size:12px;font-weight:bold;">Sem acompanhante — Termo de Responsabilidade aceito. Contato: ${params.guardianPhone}${params.guardianWhatsapp && params.guardianWhatsapp !== params.guardianPhone ? ` / WhatsApp ${params.guardianWhatsapp}` : ""}</span>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${currency(c.unitPrice)}</td>
      </tr>`
    )
    .join("");

  const companionRows = params.companions
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          Acompanhante adicional: ${c.name}${c.isFree ? " (gratuito)" : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${currency(c.unitPrice)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#333;">
    <h1 style="color:#e6007a;font-size:20px;">Compra confirmada — Divercity Park</h1>
    <p>Olá, ${params.guardianName}! Seu pagamento foi confirmado com sucesso.</p>

    <div style="background:#fafafa;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <img src="cid:${params.qrCodeCid}" alt="QR Code de acesso" width="220" height="220" />
      <p style="font-size:13px;color:#888;margin-top:8px;">Apresente este QR Code na entrada do parque</p>
      <p style="font-size:22px;font-weight:bold;letter-spacing:2px;margin:8px 0;">${params.shortCode}</p>
      <p style="font-size:12px;color:#888;">Ou informe este código curto ao operador</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${childRows}
      ${companionRows}
      <tr>
        <td style="padding:12px 0;font-weight:bold;">Total pago</td>
        <td style="padding:12px 0;font-weight:bold;text-align:right;">${currency(params.totalAmount)}</td>
      </tr>
    </table>

    ${
      params.contractedDurationMinutes
        ? `<p style="font-size:13px;color:#555;">Tempo de permanência contratado: ${params.contractedDurationMinutes} minutos, contados a partir do check-in na entrada.</p>`
        : ""
    }

    <div style="background:#fff6e5;border-radius:12px;padding:16px;margin:20px 0;font-size:13px;">
      <strong>IMPORTANTE:</strong> apresente um documento com foto da criança na entrada do parque para utilizar o passaporte.
    </div>

    <p style="font-size:13px;">
      <a href="${params.confirmationUrl}">Ver comprovante completo online</a>
    </p>

    <p style="font-size:12px;color:#aaa;margin-top:30px;">Divercity Park — este e-mail confirma sua compra antecipada de passaportes.</p>
  </div>`;
}

/**
 * Envia o e-mail de confirmação com QR Code e código curto.
 * Deve ser chamada somente após confirmação efetiva do pagamento (spec seção 10).
 */
export async function sendTicketConfirmationEmail(orderId: string): Promise<void> {
  const order = await prisma.ticketOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      children: { include: { passportType: true, companion: true } },
      companions: true,
    },
  });

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    console.error("RESEND_API_KEY/RESEND_FROM_EMAIL não configurados — e-mail de confirmação não enviado");
    return;
  }

  const qrDataUrl = await generateTicketQrCodeDataUrl(order.shortCode);
  const qrBase64 = qrDataUrl.split(",")[1];
  const qrCid = "ticket-qrcode";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const confirmationUrl = `${appUrl}/compra-antecipada/confirmacao/${order.shortCode}`;

  const html = buildEmailHtml({
    guardianName: order.guardianName,
    guardianPhone: order.guardianPhone,
    guardianWhatsapp: order.guardianWhatsapp,
    shortCode: order.shortCode,
    totalAmount: order.totalAmount.toString(),
    contractedDurationMinutes: order.contractedDurationMinutes,
    confirmationUrl,
    qrCodeCid: qrCid,
    children: order.children.map((c) => ({
      name: c.name,
      passportTypeName: c.passportType.name,
      unitPrice: c.unitPrice.toString(),
      isPNE: c.isPNE,
      hasCompanion: c.hasCompanion,
      companionName: c.companion?.name ?? null,
      unaccompanied: c.hasCompanion === false,
    })),
    companions: order.companions
      .filter((c) => !c.linkedChildId)
      .map((c) => ({ name: c.name, isFree: c.isFree, unitPrice: c.unitPrice.toString() })),
  });

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: fromEmail,
    to: order.guardianEmail,
    subject: `Sua compra Divercity Park — código ${order.shortCode}`,
    html,
    attachments: [
      {
        filename: `qrcode-${order.shortCode}.png`,
        content: qrBase64,
        contentId: qrCid,
      },
    ],
  });
}
