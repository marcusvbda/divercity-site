import { getServerSession, type Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma/client";

export async function getAuthenticatedSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (!session || session.error) return null;
  return session;
}

type RequireRoleResult =
  | { session: Session; response: null }
  | { session: null; response: NextResponse };

/**
 * Autoriza uma API route para as roles informadas. Uso:
 *
 *   const { session, response } = await requireRole(["admin", "operator"]);
 *   if (response) return response;
 */
export async function requireRole(roles: UserRole[]): Promise<RequireRoleResult> {
  const session = await getAuthenticatedSession();
  if (!session) {
    return {
      session: null,
      response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    };
  }

  if (!roles.includes(session.user.role)) {
    return {
      session: null,
      response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }),
    };
  }

  return { session, response: null };
}
