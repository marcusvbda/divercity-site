import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

// Sem caracteres ambíguos (0/O, 1/I/L) — precisa ser lido em voz alta/digitado por clientes e operadores.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const MAX_ATTEMPTS = 10;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/** Gera um código curto público (ex: "XYZ123"), garantindo unicidade no banco. */
export async function generateUniqueShortCode(exclude: ReadonlySet<string> = new Set()): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = randomCode();
    if (exclude.has(code)) continue;
    const [order, pass] = await Promise.all([
      prisma.ticketOrder.findUnique({ where: { shortCode: code }, select: { id: true } }),
      prisma.ticketPass.findUnique({ where: { shortCode: code }, select: { id: true } }),
    ]);
    if (!order && !pass) return code;
  }
  throw new Error("Não foi possível gerar um código curto único após várias tentativas");
}
