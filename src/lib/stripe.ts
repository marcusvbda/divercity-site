import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function getStripeClient(): Promise<Stripe> {
  const setting = await prisma.setting.findUnique({ where: { key: "stripe_secret_key" } });
  if (!setting?.value) {
    throw new Error("Stripe Secret Key não configurada. Configure em /admin/settings → Stripe.");
  }

  return new Stripe(setting.value, { apiVersion: "2026-08-26.dahlia" });
}

export async function getStripeWebhookSecret(): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key: "stripe_webhook_secret" } });
  return setting?.value ?? null;
}
