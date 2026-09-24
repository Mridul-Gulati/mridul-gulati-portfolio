import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { withBadges } from "@/lib/agent-format";

const AGENT_FIELDS =
  "id, slug, name, persona, problem, description, tags, thumbnail, demo_type, youtube_id, sort_order, views, hearts_count, created_at";

// Published agents in catalogue order, with derived badges attached.
// Badges are computed across the whole catalogue, then the list is trimmed to `limit`.
export async function getPublishedAgents({ limit } = {}) {
  const { data, error } = await createPublicClient()
    .from("agents")
    .select(AGENT_FIELDS)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("agents: fetch failed", error.message);
    return [];
  }
  const agents = withBadges(data);
  return limit ? agents.slice(0, limit) : agents;
}

export async function getPublishedAgentBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;
  const { data } = await createPublicClient()
    .from("agents")
    .select("slug, name")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}
