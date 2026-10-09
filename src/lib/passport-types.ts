import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function getActivePassportTypes() {
  "use cache";
  cacheTag("passport-types");
  cacheLife("max");

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

  return passportTypes.map((p) => ({
    ...p,
    weekdayChildPrice: p.weekdayChildPrice.toFixed(2),
    weekendChildPrice: p.weekendChildPrice.toFixed(2),
    weekdayCompanionPrice: p.weekdayCompanionPrice.toFixed(2),
    weekendCompanionPrice: p.weekendCompanionPrice.toFixed(2),
  }));
}
