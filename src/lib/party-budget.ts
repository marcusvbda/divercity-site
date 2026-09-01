import { prisma } from "@/lib/prisma";
import type { PartyPaymentOption } from "@/lib/schemas/parties";

export const PARTY_DURATION_MS = 3 * 60 * 60 * 1000;
const DEFAULT_ADMIN_PARTY_DURATION_MS = 4 * 60 * 60 * 1000;

export function getPartyDateEnd(date: Date): Date {
  return new Date(date.getTime() + PARTY_DURATION_MS);
}

const PARK_TIMEZONE = "America/Sao_Paulo";

function isWeekend(date: Date): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: PARK_TIMEZONE,
    weekday: "short",
  }).format(date);
  return weekday === "Sat" || weekday === "Sun";
}

export type ServicePricing = {
  salonPrice: number;
  passportPackagePrice: number;
  passportSinglePrice: number;
};

const SERVICE_KEYS = {
  salon: "party_salon",
  passportPackage: "party_passport_package",
  passportSingle: "party_passport_single",
} as const;

function servicePrice(
  services: { key: string | null; name: string; weekdayPrice: unknown; weekendPrice: unknown }[],
  key: string,
  weekend: boolean
): number {
  const service = services.find((s) => s.key === key);
  if (!service) {
    throw new Error(
      `Serviço "${key}" não cadastrado. Configure em /admin/services.`
    );
  }
  return Number(weekend ? service.weekendPrice : service.weekdayPrice);
}

export async function getServicePricing(date: Date): Promise<ServicePricing> {
  const services = await prisma.service.findMany({
    where: { key: { in: Object.values(SERVICE_KEYS) } },
  });
  const weekend = isWeekend(date);

  return {
    salonPrice: servicePrice(services, SERVICE_KEYS.salon, weekend),
    passportPackagePrice: servicePrice(services, SERVICE_KEYS.passportPackage, weekend),
    passportSinglePrice: servicePrice(services, SERVICE_KEYS.passportSingle, weekend),
  };
}

export async function isSlotAvailable(date: Date, dateEnd: Date): Promise<boolean> {
  const blockingParties = await prisma.party.findMany({
    where: { status: { not: "cancelled" } },
    select: { date: true, dateEnd: true },
  });

  const conflict = blockingParties.some((p) => {
    const pStart = new Date(p.date);
    const pEnd = p.dateEnd
      ? new Date(p.dateEnd)
      : new Date(pStart.getTime() + DEFAULT_ADMIN_PARTY_DURATION_MS);
    return date < pEnd && dateEnd > pStart;
  });

  return !conflict;
}

export const PASSPORT_PACKAGE_SIZE = 10;

export type PartyQuote = {
  salonPrice: number;
  passportPackagePrice: number | null;
  passportSinglePrice: number | null;
  passportSingleCount: number | null;
  total: number;
};

export async function computeQuote({
  date,
  paymentOption,
  passportSingleCount = 0,
}: {
  date: Date;
  paymentOption: PartyPaymentOption;
  passportSingleCount?: number;
}): Promise<PartyQuote> {
  const pricing = await getServicePricing(date);

  if (paymentOption !== "salon_and_passports") {
    return {
      salonPrice: pricing.salonPrice,
      passportPackagePrice: null,
      passportSinglePrice: null,
      passportSingleCount: null,
      total: pricing.salonPrice,
    };
  }

  const total =
    pricing.salonPrice + pricing.passportPackagePrice + passportSingleCount * pricing.passportSinglePrice;

  return {
    salonPrice: pricing.salonPrice,
    passportPackagePrice: pricing.passportPackagePrice,
    passportSinglePrice: pricing.passportSinglePrice,
    passportSingleCount,
    total,
  };
}
