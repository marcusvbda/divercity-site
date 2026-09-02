import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

let cachedClient: { secretKey: string; client: Stripe } | null = null;

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

/** Cliente Stripe construído a partir da credencial configurada pelo Admin (/admin/settings), nunca de env/código. */
export async function getStripeClient(): Promise<Stripe> {
  const secretKey = await getSetting("stripe_secret_key");
  if (!secretKey) {
    throw new Error("Stripe não configurado. Cadastre as credenciais em /admin/settings.");
  }
  if (cachedClient?.secretKey === secretKey) return cachedClient.client;

  const client = new Stripe(secretKey);
  cachedClient = { secretKey, client };
  return client;
}

export async function getStripeWebhookSecret(): Promise<string> {
  const secret = await getSetting("stripe_webhook_secret");
  if (!secret) {
    throw new Error("Webhook secret do Stripe não configurado em /admin/settings.");
  }
  return secret;
}
