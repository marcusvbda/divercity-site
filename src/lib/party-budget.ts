import { prisma } from "@/lib/prisma";
import { getContentType } from "@/lib/cms";
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

type PriceTier = { id: number; value: { label: string; valor: string; acompanhante: string } };

export async function getSalonPrice(date: Date): Promise<number> {
  const priceSection = await getContentType("PriceSection");
  const tiers = priceSection?.Tiers;
  const list: PriceTier[] | undefined = isWeekend(date)
    ? tiers?.weekendTiers
    : tiers?.weekdayTiers;

  const tier = list?.find((t) => t.value?.label === "3 Horas");
  if (!tier) {
    throw new Error(
      'Valor do salão (tier "3 Horas") não encontrado no CMS. Configure em /admin/cms → PriceSection → Tiers.'
    );
  }

  const value = Number(tier.value.valor);
  if (Number.isNaN(value)) {
    throw new Error('Valor do salão configurado ("3 Horas") é inválido.');
  }
  return value;
}

export async function getPassportPackagePrice(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: "party_passport_package_price" },
  });
  if (!setting?.value) {
    throw new Error(
      "Valor do pacote de passaportes não configurado. Configure em /admin/settings → Festas."
    );
  }

  const value = Number(setting.value);
  if (Number.isNaN(value)) {
    throw new Error("Valor do pacote de passaportes configurado é inválido.");
  }
  return value;
}

export async function isSlotAvailable(date: Date, dateEnd: Date): Promise<boolean> {
  const blockingParties = await prisma.party.findMany({
    where: {
      OR: [{ status: "confirmed" }, { status: "pending", paymentStatus: "paid" }],
    },
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

export type PartyQuote = {
  salonPrice: number;
  passportPackagePrice: number | null;
  total: number;
};

export async function computeQuote({
  date,
  paymentOption,
}: {
  date: Date;
  paymentOption: PartyPaymentOption;
}): Promise<PartyQuote> {
  const salonPrice = await getSalonPrice(date);
  const passportPackagePrice =
    paymentOption === "salon_and_passports" ? await getPassportPackagePrice() : null;
  const total = salonPrice + (passportPackagePrice ?? 0);

  return { salonPrice, passportPackagePrice, total };
}
