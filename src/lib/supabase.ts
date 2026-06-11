import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const key = process.env.SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
