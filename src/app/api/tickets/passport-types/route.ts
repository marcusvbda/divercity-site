import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lista pública dos tipos de passaporte ativos, para o seletor da compra antecipada. */
export async function GET() {
  const passportTypes = await prisma.passportType.findMany({
    where: { active: true },
    orderBy: [{ sort: "asc" }, { durationMinutes: "asc" }],
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      weekdayChildPrice: true,
      weekendChildPrice: true,
      weekdayCompanionPrice: true,
      weekendCompanionPrice: true,
    },
  });

  return NextResponse.json({
    data: passportTypes.map((p) => ({
      ...p,
      weekdayChildPrice: p.weekdayChildPrice.toFixed(2),
      weekendChildPrice: p.weekendChildPrice.toFixed(2),
      weekdayCompanionPrice: p.weekdayCompanionPrice.toFixed(2),
      weekendCompanionPrice: p.weekendCompanionPrice.toFixed(2),
    })),
  });
}
