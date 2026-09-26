import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Throttling for the admin login, backed by the admin_login_attempts table so limits hold
// across serverless instances and deploys.
export const LIMITS = {
  passwordFailures: { max: 5, windowMinutes: 15 }, // per network
  linkCooldownSeconds: 60, // between magic-link emails
  linksPerHour: 5,
};

const since = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

async function recent(kind, minutes, ipHash) {
  let query = createAdminClient()
    .from("admin_login_attempts")
    .select("created_at")
    .eq("kind", kind)
    .gte("created_at", since(minutes))
    .order("created_at", { ascending: true });
  if (ipHash) query = query.eq("ip_hash", ipHash);
  const { data, error } = await query;
  if (error) {
    // Fail closed: if we can't check the limit, don't allow the attempt.
    console.error("login-guard: lookup failed", error.message);
    return null;
  }
  return data.map((row) => new Date(row.created_at).getTime());
}

export async function record(kind, ipHash) {
  const { error } = await createAdminClient().from("admin_login_attempts").insert({ kind, ip_hash: ipHash });
  if (error) console.error("login-guard: record failed", error.message);
}

// Seconds until this network may try a password again, or 0 if allowed.
// Infinity means the limiter itself is unavailable: fail closed.
export async function passwordLockout(ipHash) {
  const { max, windowMinutes } = LIMITS.passwordFailures;
  const failures = await recent("password_fail", windowMinutes, ipHash);
  if (failures === null) return Infinity;
  if (failures.length < max) return 0;
  const unlockAt = failures[failures.length - max] + windowMinutes * 60_000;
  return Math.max(1, Math.ceil((unlockAt - Date.now()) / 1000));
}

// Seconds until another magic link may be sent, or 0 if allowed (Infinity: limiter unavailable).
// Only the owner ever gets links, so this is a global limit rather than per network.
export async function linkWait() {
  const sent = await recent("link_sent", 60);
  if (sent === null) return Infinity;
  const last = sent[sent.length - 1];
  if (last && Date.now() - last < LIMITS.linkCooldownSeconds * 1000) {
    return Math.ceil((last + LIMITS.linkCooldownSeconds * 1000 - Date.now()) / 1000);
  }
  if (sent.length >= LIMITS.linksPerHour) {
    const freeAt = sent[sent.length - LIMITS.linksPerHour] + 60 * 60_000;
    return Math.max(1, Math.ceil((freeAt - Date.now()) / 1000));
  }
  return 0;
}
