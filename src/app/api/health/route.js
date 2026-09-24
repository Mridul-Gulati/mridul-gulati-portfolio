import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public health check: a trivial anon-key read that proves the Supabase connection
// works from the deployed site, and shows when the keep-alive cron last ran.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("heartbeat")
    .select("pinged_at")
    .single();

  if (error) {
    console.error("health check failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  return NextResponse.json({ ok: true, last_keep_alive: data.pinged_at });
}
