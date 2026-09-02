import { prisma } from "@/lib/prisma";
import { getAgeInMonths } from "@/lib/ticket-pricing";
import type { Prisma, TicketOrderStatus } from "@/generated/prisma/client";

/** Códigos curtos são sempre gerados em maiúsculas (spec seção 8) — normaliza entrada do operador. */
export function normalizeShortCode(shortCode: string): string {
  return shortCode.trim().toUpperCase();
}

export const operationalOrderInclude = {
  children: {
    include: {
      passportType: true,
      companion: true,
    },
  },
  companions: true,
  checkedInBy: true,
  checkedOutBy: true,
} satisfies Prisma.TicketOrderInclude;

type OperationalOrderRecord = Prisma.TicketOrderGetPayload<{
  include: typeof operationalOrderInclude;
}>;

export type OperationalChild = {
  id: string;
  name: string;
  birthDate: string;
  ageMonths: number;
  passportTypeName: string;
  passportDurationMinutes: number;
  isPNE: boolean;
  unitPrice: string;
  hasCompanion: boolean | null;
  unaccompaniedTermsAcceptedAt: string | null;
  companion: { name: string; phone: string | null } | null;
};

export type OperationalCompanion = {
  id: string;
  name: string;
  phone: string | null;
  isFree: boolean;
  unitPrice: string;
};

export type OperationalOrder = {
  id: string;
  shortCode: string;
  status: TicketOrderStatus;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianWhatsapp: string;
  totalAmount: string;
  contractedDurationMinutes: number | null;
  children: OperationalChild[];
  /** Acompanhantes adicionais pagos, não vinculados a nenhuma criança. */
  companions: OperationalCompanion[];
  checkedInAt: string | null;
  checkedInByName: string | null;
  checkedOutAt: string | null;
  checkedOutByName: string | null;
  overtimeMinutes: number | null;
  /** Calculados no servidor a partir de checkedInAt + contractedDurationMinutes (spec seção 16). */
  elapsedMinutes: number | null;
  remainingMinutes: number | null;
  plannedEndAt: string | null;
};

export function serializeOperationalOrder(order: OperationalOrderRecord): OperationalOrder {
  const now = new Date();

  let elapsedMinutes: number | null = null;
  let remainingMinutes: number | null = null;
  let plannedEndAt: string | null = null;

  if (order.checkedInAt) {
    const reference = order.checkedOutAt ?? now;
    elapsedMinutes = Math.round((reference.getTime() - order.checkedInAt.getTime()) / 60000);
    if (order.contractedDurationMinutes != null) {
      remainingMinutes = order.contractedDurationMinutes - elapsedMinutes;
      plannedEndAt = new Date(
        order.checkedInAt.getTime() + order.contractedDurationMinutes * 60000
      ).toISOString();
    }
  }

  const additionalCompanions = order.companions.filter((c) => c.linkedChildId === null);

  return {
    id: order.id,
    shortCode: order.shortCode,
    status: order.status,
    guardianName: order.guardianName,
    guardianEmail: order.guardianEmail,
    guardianPhone: order.guardianPhone,
    guardianWhatsapp: order.guardianWhatsapp,
    totalAmount: order.totalAmount.toFixed(2),
    contractedDurationMinutes: order.contractedDurationMinutes,
    children: order.children.map((child) => ({
      id: child.id,
      name: child.name,
      birthDate: child.birthDate.toISOString(),
      ageMonths: getAgeInMonths(child.birthDate, now),
      passportTypeName: child.passportType.name,
      passportDurationMinutes: child.passportType.durationMinutes,
      isPNE: child.isPNE,
      unitPrice: child.unitPrice.toFixed(2),
      hasCompanion: child.hasCompanion,
      unaccompaniedTermsAcceptedAt: child.unaccompaniedTermsAcceptedAt?.toISOString() ?? null,
      companion: child.companion ? { name: child.companion.name, phone: child.companion.phone } : null,
    })),
    companions: additionalCompanions.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      isFree: c.isFree,
      unitPrice: c.unitPrice.toFixed(2),
    })),
    checkedInAt: order.checkedInAt?.toISOString() ?? null,
    checkedInByName: order.checkedInBy ? (order.checkedInBy.name ?? order.checkedInBy.email) : null,
    checkedOutAt: order.checkedOutAt?.toISOString() ?? null,
    checkedOutByName: order.checkedOutBy ? (order.checkedOutBy.name ?? order.checkedOutBy.email) : null,
    overtimeMinutes: order.overtimeMinutes,
    elapsedMinutes,
    remainingMinutes,
    plannedEndAt,
  };
}

/** Busca o pedido pelo código curto (normalizado) já pronto para a tela operacional. */
export async function getOperationalOrder(shortCode: string): Promise<OperationalOrder | null> {
  const order = await prisma.ticketOrder.findUnique({
    where: { shortCode: normalizeShortCode(shortCode) },
    include: operationalOrderInclude,
  });
  if (!order) return null;
  return serializeOperationalOrder(order);
}

/** Busca o registro bruto (para as rotas de check-in/check-out validarem e atualizarem o estado). */
export async function findOperationalOrderRecord(shortCode: string) {
  return prisma.ticketOrder.findUnique({
    where: { shortCode: normalizeShortCode(shortCode) },
    include: operationalOrderInclude,
  });
}
