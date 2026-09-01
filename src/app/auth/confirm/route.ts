import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/admin/login/redefinir-senha";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}${next}?error=invalid_link`);
  }

  // Não consumir o token aqui: esta rota recebe GET de scanners de e-mail
  // (Gmail Safe Browsing, Outlook Safe Links, etc.), que "gastam" o token
  // de uso único antes do clique real do usuário. A verificação real
  // acontece no client (ResetPasswordForm), que scanners não executam.
  const redirectUrl = new URL(next, origin);
  redirectUrl.searchParams.set("token_hash", token_hash);
  redirectUrl.searchParams.set("type", type);

  return NextResponse.redirect(redirectUrl);
}
