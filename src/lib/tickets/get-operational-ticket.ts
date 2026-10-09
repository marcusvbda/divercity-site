import { prisma } from "@/lib/prisma";
import { getAgeInMonths } from "@/lib/ticket-pricing";
import type {
  Prisma,
  TicketOrderStatus,
  TicketPassKind,
  TicketPassStatus,
} from "@/generated/prisma/client";

export function normalizeShortCode(shortCode: string): string {
  return shortCode.trim().toUpperCase();
}

export const operationalTicketInclude = {
  order: {
    include: {
      passes: {
        include: {
          child: { select: { name: true } },
          companion: { select: { name: true } },
        },
        orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
      },
    },
  },
  child: { include: { passportType: true, companion: true } },
  companion: { include: { passportType: true } },
  checkedInBy: true,
  checkedOutBy: true,
} satisfies Prisma.TicketPassInclude;

type OperationalTicketRecord = Prisma.TicketPassGetPayload<{
  include: typeof operationalTicketInclude;
}>;

export type OperationalTicketHolder = {
  name: string;
  phone: string | null;
  birthDate: string | null;
  ageMonths: number | null;
  passportTypeName: string;
  passportDurationMinutes: number;
  isPNE: boolean;
  unitPrice: string;
  hasCompanion: boolean | null;
  unaccompaniedTermsAcceptedAt: string | null;
};

export type OperationalTicketOrder = {
  id: string;
  shortCode: string;
  status: TicketOrderStatus;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianWhatsapp: string;
  totalAmount: string;
};

export type OperationalSiblingTicket = {
  shortCode: string;
  kind: TicketPassKind;
  holderName: string;
  status: TicketPassStatus;
};

export type OperationalTicket = {
  id: string;
  shortCode: string;
  kind: TicketPassKind;
  status: TicketPassStatus;
  contractedDurationMinutes: number;
  checkedInAt: string | null;
  checkedInByName: string | null;
  checkedOutAt: string | null;
  checkedOutByName: string | null;
  overtimeMinutes: number | null;
  elapsedMinutes: number | null;
  remainingMinutes: number | null;
  plannedEndAt: string | null;
  holder: OperationalTicketHolder;
  companionIncluded: { name: string; phone: string | null } | null;
  order: OperationalTicketOrder;
  otherTickets: OperationalSiblingTicket[];
};

export function serializeOperationalTicket(pass: OperationalTicketRecord): OperationalTicket {
  const now = new Date();

  let elapsedMinutes: number | null = null;
  let remainingMinutes: number | null = null;
  let plannedEndAt: string | null = null;

  if (pass.checkedInAt) {
    const reference = pass.checkedOutAt ?? now;
    elapsedMinutes = Math.round((reference.getTime() - pass.checkedInAt.getTime()) / 60000);
    remainingMinutes = pass.contractedDurationMinutes - elapsedMinutes;
    plannedEndAt = new Date(
      pass.checkedInAt.getTime() + pass.contractedDurationMinutes * 60000
    ).toISOString();
  }

  const holder: OperationalTicketHolder = pass.child
    ? {
        name: pass.child.name,
        phone: null,
        birthDate: pass.child.birthDate.toISOString(),
        ageMonths: getAgeInMonths(pass.child.birthDate, now),
        passportTypeName: pass.child.passportType.name,
        passportDurationMinutes: pass.child.passportType.durationMinutes,
        isPNE: pass.child.isPNE,
        unitPrice: pass.child.unitPrice.toFixed(2),
        hasCompanion: pass.child.hasCompanion,
        unaccompaniedTermsAcceptedAt: pass.child.unaccompaniedTermsAcceptedAt?.toISOString() ?? null,
      }
    : {
        name: pass.companion?.name ?? "",
        phone: pass.companion?.phone ?? null,
        birthDate: null,
        ageMonths: null,
        passportTypeName: pass.companion?.passportType?.name ?? "",
        passportDurationMinutes: pass.companion?.passportType?.durationMinutes ?? pass.contractedDurationMinutes,
        isPNE: false,
        unitPrice: Number(pass.companion?.unitPrice ?? 0).toFixed(2),
        hasCompanion: null,
        unaccompaniedTermsAcceptedAt: null,
      };

  const order = pass.order;

  return {
    id: pass.id,
    shortCode: pass.shortCode,
    kind: pass.kind,
    status: pass.status,
    contractedDurationMinutes: pass.contractedDurationMinutes,
    checkedInAt: pass.checkedInAt?.toISOString() ?? null,
    checkedInByName: pass.checkedInBy ? (pass.checkedInBy.name ?? pass.checkedInBy.email) : null,
    checkedOutAt: pass.checkedOutAt?.toISOString() ?? null,
    checkedOutByName: pass.checkedOutBy ? (pass.checkedOutBy.name ?? pass.checkedOutBy.email) : null,
    overtimeMinutes: pass.overtimeMinutes,
    elapsedMinutes,
    remainingMinutes,
    plannedEndAt,
    holder,
    companionIncluded: pass.child?.companion
      ? { name: pass.child.companion.name, phone: pass.child.companion.phone }
      : null,
    order: {
      id: order.id,
      shortCode: order.shortCode,
      status: order.status,
      guardianName: order.guardianName,
      guardianEmail: order.guardianEmail,
      guardianPhone: order.guardianPhone,
      guardianWhatsapp: order.guardianWhatsapp,
      totalAmount: order.totalAmount.toFixed(2),
    },
    otherTickets: order.passes
      .filter((p) => p.id !== pass.id)
      .map((p) => ({
        shortCode: p.shortCode,
        kind: p.kind,
        holderName: p.child?.name ?? p.companion?.name ?? "",
        status: p.status,
      })),
  };
}

export async function findOperationalTicketRecord(shortCode: string) {
  return prisma.ticketPass.findUnique({
    where: { shortCode: normalizeShortCode(shortCode) },
    include: operationalTicketInclude,
  });
}

export async function getOperationalTicket(shortCode: string): Promise<OperationalTicket | null> {
  const pass = await findOperationalTicketRecord(shortCode);
  return pass ? serializeOperationalTicket(pass) : null;
}
