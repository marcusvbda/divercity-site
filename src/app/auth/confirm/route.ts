import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/admin/login/redefinir-senha";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}${next}?error=invalid_link`);
  }

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}${next}?error=invalid_link`);
  }

  const { access_token, refresh_token } = data.session;
  const redirectUrl = new URL(next, origin);
  redirectUrl.hash = `access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`;

  return NextResponse.redirect(redirectUrl);
}
