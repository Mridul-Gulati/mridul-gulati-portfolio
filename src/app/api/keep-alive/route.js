import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Daily Vercel cron (see vercel.json) that writes to the database so the free-tier
// Supabase project never pauses from inactivity. Do not remove without a replacement.
// Vercel sends "Authorization: Bearer $CRON_SECRET" automatically when CRON_SECRET is set.
export const dynamic = "force-dynamic";

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await createAdminClient()
    .from("heartbeat")
    .upsert({ id: 1, pinged_at: new Date().toISOString() })
    .select("pinged_at")
    .single();

  if (error) {
    console.error("keep-alive failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pinged_at: data.pinged_at });
}
