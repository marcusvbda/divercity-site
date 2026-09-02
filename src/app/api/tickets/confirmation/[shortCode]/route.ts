import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketQrCodeDataUrl } from "@/lib/ticket-qrcode";

export async function GET(req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;

  const order = await prisma.ticketOrder.findUnique({
    where: { shortCode: shortCode.trim().toUpperCase() },
    include: {
      children: { include: { passportType: true, companion: true } },
      companions: true,
    },
  });

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
