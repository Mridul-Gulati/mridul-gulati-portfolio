import { createClient } from "@supabase/supabase-js";

// Cookie-less anon client for public reads in Server Components. Unlike ./server.js it doesn't
// touch cookies, so pages using it can be statically generated and revalidated (ISR).
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
