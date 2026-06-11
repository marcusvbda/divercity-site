import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabaseBrowser = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, flowType: "pkce" },
});
