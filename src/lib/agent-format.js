// Pure agent helpers, safe to import from client and server components.

const NEW_FOR_DAYS = 14;

// Badges are derived, never set by hand:
// - "new": created in the last 14 days
// - "most-liked": the agent(s) with the highest heart count, if anyone has liked anything
export function withBadges(agents) {
  const cutoff = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;
  const topHearts = Math.max(0, ...agents.map((a) => a.hearts_count));

  return agents.map((agent) => ({
    ...agent,
    badges: [
      new Date(agent.created_at).getTime() >= cutoff && "new",
      topHearts > 0 && agent.hearts_count === topHearts && "most-liked",
    ].filter(Boolean),
  }));
}

// "Liked by 100+" style aggregate: exact below 10, then rounded down to a friendly threshold.
export function formatLikes(count) {
  if (count <= 0) return null;
  if (count < 10) return `Liked by ${count}`;
  const step = [10000, 5000, 1000, 500, 100, 50, 25, 10].find((s) => count >= s);
  return `Liked by ${step.toLocaleString("en")}+`;
}

export function thumbnailFor(agent) {
  if (agent.thumbnail) return agent.thumbnail;
  if (agent.youtube_id) return `https://i.ytimg.com/vi/${agent.youtube_id}/hqdefault.jpg`;
  return null;
}
