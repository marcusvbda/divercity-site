import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export const FEATURES = [
  { key: "advance_purchase", name: "Compra antecipada", enabled: true },
  { key: "party_budget", name: "Orçamento de festa", enabled: true },
  { key: "instagram_carousel", name: "Carousel do Instagram", enabled: true },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const FEATURES_CACHE_TAG = "features";

export async function getFeatures() {
  "use cache";
  cacheTag(FEATURES_CACHE_TAG);
  cacheLife("max");

  const rows = await prisma.feature.findMany({
    select: { key: true, name: true, enabled: true },
  });
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return FEATURES.map((feature) => {
    const row = byKey.get(feature.key);
    return {
      key: feature.key,
      name: row?.name ?? feature.name,
      enabled: row?.enabled ?? feature.enabled,
    };
  });
}

export async function isFeatureEnabled(key: FeatureKey): Promise<boolean> {
  const features = await getFeatures();
  return features.find((feature) => feature.key === key)?.enabled ?? true;
}
