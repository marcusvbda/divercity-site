import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type { PassportType } from "@/generated/prisma/client";
import type { TicketQuoteRequest } from "@/lib/schemas/tickets";

/** 0 a 12 meses: desconto de 50% (regra de negócio, spec seção 3). */
const INFANT_MAX_AGE_MONTHS = 12;
/** 0 a 4 anos: elegível a 1 acompanhante gratuito (spec seção 4). */
const COMPANION_ELIGIBLE_MAX_AGE_MONTHS = 60;
const DISCOUNT_RATE = new Prisma.Decimal(0.5);

export class TicketPricingError extends Error {}

export function getAgeInMonths(birthDate: Date, at: Date = new Date()): number {
  let months = (at.getFullYear() - birthDate.getFullYear()) * 12 + (at.getMonth() - birthDate.getMonth());
  if (at.getDate() < birthDate.getDate()) months -= 1;
  return Math.max(months, 0);
}

function computeChildUnitPrice(
  passportType: PassportType,
  visitDayType: TicketQuoteRequest["visitDayType"],
  ageMonths: number,
  isPNE: boolean
): Prisma.Decimal {
  const base =
    visitDayType === "weekday" ? passportType.weekdayChildPrice : passportType.weekendChildPrice;
  const isInfant = ageMonths < INFANT_MAX_AGE_MONTHS;
  return isInfant || isPNE ? base.mul(DISCOUNT_RATE) : base;
}

export type PricedChild = TicketQuoteRequest["children"][number] & {
  index: number;
  passportType: PassportType;
  ageMonths: number;
  unitPrice: Prisma.Decimal;
};

export type PricedCompanion = TicketQuoteRequest["companions"][number] & {
  isFree: boolean;
  linkedChild: PricedChild | null;
  passportType: PassportType | null;
  unitPrice: Prisma.Decimal;
};

export type PricingResult = {
  children: PricedChild[];
  companions: PricedCompanion[];
  total: Prisma.Decimal;
};

/**
 * Recalcula e valida o preço de um pedido inteiramente no servidor.
 * NUNCA aceitar preço/idade/desconto vindo do frontend (spec seção 22).
 */
export async function priceOrder(input: TicketQuoteRequest): Promise<PricingResult> {
  const passportTypeIds = new Set<string>();
  input.children.forEach((c) => passportTypeIds.add(c.passportTypeId));
  input.companions.forEach((c) => c.passportTypeId && passportTypeIds.add(c.passportTypeId));

  const passportTypes = await prisma.passportType.findMany({
    where: { id: { in: [...passportTypeIds] }, active: true },
  });
  const byId = new Map(passportTypes.map((p) => [p.id, p]));

  const pricedChildren: PricedChild[] = input.children.map((child, index) => {
    const passportType = byId.get(child.passportTypeId);
    if (!passportType) {
      throw new TicketPricingError(`Tipo de passaporte inválido para "${child.name}"`);
    }

    const birthDate = new Date(child.birthDate);
    const ageMonths = getAgeInMonths(birthDate);
    const eligibleForCompanionRule = ageMonths < COMPANION_ELIGIBLE_MAX_AGE_MONTHS;

    if (child.hasCompanion !== undefined && !eligibleForCompanionRule) {
      throw new TicketPricingError(
        `"${child.name}" tem mais de 4 anos — a regra de acompanhante gratuito não se aplica`
      );
    }
    if (eligibleForCompanionRule && child.hasCompanion === false && !child.unaccompaniedTermsAccepted) {
      throw new TicketPricingError(
        `É necessário aceitar o Termo de Responsabilidade para "${child.name}" ficar sem acompanhante`
      );
    }

    const unitPrice = computeChildUnitPrice(passportType, input.visitDayType, ageMonths, child.isPNE);
    return { ...child, index, passportType, ageMonths, unitPrice };
  });

  const pricedCompanions: PricedCompanion[] = input.companions.map((companion) => {
    const linkedChild =
      companion.linkedChildIndex !== undefined ? (pricedChildren[companion.linkedChildIndex] ?? null) : null;

    if (companion.linkedChildIndex !== undefined && !linkedChild) {
      throw new TicketPricingError("Acompanhante vinculado a uma criança inexistente");
    }

    const isFree =
      !!linkedChild && linkedChild.hasCompanion === true && linkedChild.ageMonths < COMPANION_ELIGIBLE_MAX_AGE_MONTHS;

    if (linkedChild && !isFree) {
      throw new TicketPricingError(
        `Não é possível vincular um acompanhante gratuito a "${linkedChild.name}" nessas condições`
      );
    }

    if (isFree) {
      return { ...companion, isFree: true, linkedChild, passportType: null, unitPrice: new Prisma.Decimal(0) };
    }

    if (!companion.passportTypeId) {
      throw new TicketPricingError(`Selecione a duração do ingresso para o acompanhante "${companion.name}"`);
    }
    const passportType = byId.get(companion.passportTypeId);
    if (!passportType) {
      throw new TicketPricingError(`Tipo de passaporte inválido para o acompanhante "${companion.name}"`);
    }
    const base =
      input.visitDayType === "weekday" ? passportType.weekdayCompanionPrice : passportType.weekendCompanionPrice;
    return { ...companion, isFree: false, linkedChild: null, passportType, unitPrice: base };
  });

  for (const child of pricedChildren) {
    if (child.hasCompanion === true) {
      const hasLinkedCompanion = pricedCompanions.some((c) => c.linkedChild === child);
      if (!hasLinkedCompanion) {
        throw new TicketPricingError(`Informe os dados do acompanhante gratuito de "${child.name}"`);
      }
    }
  }

  const total = [...pricedChildren.map((c) => c.unitPrice), ...pricedCompanions.map((c) => c.unitPrice)].reduce(
    (sum, v) => sum.add(v),
    new Prisma.Decimal(0)
  );

  return { children: pricedChildren, companions: pricedCompanions, total };
}

/** Duração contratada da compra = a maior duração entre os passaportes de criança do pedido. */
export function getContractedDurationMinutes(children: { passportType: { durationMinutes: number } }[]): number {
  return Math.max(...children.map((c) => c.passportType.durationMinutes));
}
