"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getIpHash, getVisitorHash } from "@/lib/visitor";

// Caps hearts from one network, so clearing cookies in a loop can't inflate counts.
const HEART_IP_LIMIT = { max: 30, windowMinutes: 60 };
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

async function publishedAgentId(supabase, slug) {
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) return null;
  const { data } = await supabase
    .from("agents")
    .select("id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data?.id ?? null;
}

// Slugs of the agents this visitor has already hearted.
export async function getMyHearts() {
  const visitorHash = await getVisitorHash();
  if (!visitorHash) return [];

  const { data, error } = await createAdminClient()
    .from("hearts")
    .select("agents(slug)")
    .eq("visitor_hash", visitorHash);

  if (error) {
    console.error("hearts: lookup failed", error.message);
    return [];
  }
  return data.map((row) => row.agents?.slug).filter(Boolean);
}

// One heart per visitor per agent. Duplicate hearts are ignored by the primary key.
// Returns { ok, counted } where counted is true only when a new heart was recorded.
export async function heartAgent(slug) {
  const supabase = createAdminClient();
  const agentId = await publishedAgentId(supabase, slug);
  if (!agentId) return { ok: false };

  const [visitorHash, ipHash] = await Promise.all([getVisitorHash({ create: true }), getIpHash()]);

  const since = new Date(Date.now() - HEART_IP_LIMIT.windowMinutes * 60_000).toISOString();
  const { count } = await supabase
    .from("hearts")
    .select("agent_id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (count >= HEART_IP_LIMIT.max) return { ok: false };

  const { data, error } = await supabase
    .from("hearts")
    .upsert(
      { agent_id: agentId, visitor_hash: visitorHash, ip_hash: ipHash },
      { onConflict: "agent_id,visitor_hash", ignoreDuplicates: true }
    )
    .select("agent_id");

  if (error) {
    console.error("hearts: insert failed", error.message);
    return { ok: false };
  }
  return { ok: true, counted: data.length > 0 };
}

export async function recordAgentView(slug) {
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) return;
  const { error } = await createAdminClient().rpc("increment_agent_views", { p_slug: slug });
  if (error) console.error("agents: view increment failed", error.message);
}
