import type { TicketPassKind, TicketPassStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { generateTicketQrCodeDataUrl } from "@/lib/ticket-qrcode";

export type ConfirmationTicket = {
  shortCode: string;
  kind: TicketPassKind;
  holderName: string;
  passportTypeName: string;
  contractedDurationMinutes: number;
  status: TicketPassStatus;
  qrCodeDataUrl: string;
  companionIncluded: { name: string } | null;
  isPNE: boolean;
  unitPrice: string;
};

export async function getOrderTickets(orderId: string): Promise<ConfirmationTicket[]> {
  const passes = await prisma.ticketPass.findMany({
    where: { orderId },
    orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
    include: {
      child: { include: { passportType: true, companion: true } },
      companion: { include: { passportType: true } },
    },
  });

  return Promise.all(
    passes.map(async (pass) => {
      const holder = pass.child
        ? {
            holderName: pass.child.name,
            passportTypeName: pass.child.passportType.name,
            companionIncluded: pass.child.companion ? { name: pass.child.companion.name } : null,
            isPNE: pass.child.isPNE,
            unitPrice: pass.child.unitPrice.toFixed(2),
          }
        : {
            holderName: pass.companion?.name ?? "",
            passportTypeName: pass.companion?.passportType?.name ?? "",
            companionIncluded: null,
            isPNE: false,
            unitPrice: Number(pass.companion?.unitPrice ?? 0).toFixed(2),
          };

      return {
        shortCode: pass.shortCode,
        kind: pass.kind,
        contractedDurationMinutes: pass.contractedDurationMinutes,
        status: pass.status,
        qrCodeDataUrl: await generateTicketQrCodeDataUrl(pass.shortCode),
        ...holder,
      };
    })
  );
}
