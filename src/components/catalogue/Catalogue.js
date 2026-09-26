"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { buttonClass } from "@/components/ui";
import { getMyHearts, heartAgent, recordAgentView } from "@/app/(site)/projects/actions";
import AgentCard from "./AgentCard";
import HeartButton from "./HeartButton";
import DemoModal from "./DemoModal";

const sorts = {
  featured: { label: "Featured", compare: (a, b) => a.sort_order - b.sort_order },
  newest: { label: "Newest", compare: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
  liked: { label: "Most liked", compare: (a, b) => b.hearts_count - a.hearts_count },
  viewed: { label: "Most viewed", compare: (a, b) => b.views - a.views },
};

function matches(agent, query) {
  if (!query) return true;
  const haystack = [agent.name, agent.persona, agent.problem, ...agent.tags].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

// Count each agent's demo view at most once per browser session.
function shouldCountView(slug) {
  try {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage unavailable (private mode etc.): count it anyway.
  }
  return true;
}

export default function Catalogue({ agents }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [sort, setSort] = useState("featured");
  const [liked, setLiked] = useState(() => new Set());
  const [heartCounts, setHeartCounts] = useState(() =>
    Object.fromEntries(agents.map((a) => [a.slug, a.hearts_count]))
  );
  const [openSlug, setOpenSlug] = useState(null);

  // The page is statically cached, so this visitor's likes are fetched after load.
  useEffect(() => {
    getMyHearts().then((slugs) => setLiked(new Set(slugs)));
  }, []);

  // Deep link: /projects?agent=<slug> opens that agent's demo.
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("agent");
    if (slug && agents.some((a) => a.slug === slug)) openDemo(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tags = useMemo(() => [...new Set(agents.flatMap((a) => a.tags))].sort(), [agents]);

  const visible = useMemo(
    () =>
      agents
        .filter((a) => (!activeTag || a.tags.includes(activeTag)) && matches(a, query.trim()))
        .map((a) => ({ ...a, hearts_count: heartCounts[a.slug] ?? a.hearts_count }))
        .sort(sorts[sort].compare),
    [agents, activeTag, query, sort, heartCounts]
  );

  function openDemo(slug) {
    setOpenSlug(slug);
    window.history.replaceState(null, "", `?agent=${slug}`);
    if (shouldCountView(slug)) recordAgentView(slug);
  }

  function closeDemo() {
    setOpenSlug(null);
    window.history.replaceState(null, "", window.location.pathname);
  }

  async function like(slug) {
    if (liked.has(slug)) return;
    const bump = (delta) => setHeartCounts((c) => ({ ...c, [slug]: (c[slug] ?? 0) + delta }));

    // Optimistic: fill the heart and bump the count immediately, then reconcile.
    setLiked((s) => new Set(s).add(slug));
    bump(1);

    const result = await heartAgent(slug);
    if (!result.ok) {
      setLiked((s) => {
        const next = new Set(s);
        next.delete(slug);
        return next;
      });
      bump(-1);
    } else if (!result.counted) {
      bump(-1); // Already liked earlier (e.g. another tab); keep it filled, don't double count.
    }
  }

  const openAgent = agents.find((a) => a.slug === openSlug) ?? null;
  const filtersActive = query || activeTag;

  return (
    <>
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1">
            <span className="sr-only">Search agents</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role or tag"
              className="w-full rounded-lg border border-dark/20 bg-white px-4 py-3 outline-none focus:border-primary dark:border-light/20 dark:bg-white/5 dark:focus:border-primary-dark"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-dark/20 bg-white px-4 py-3 outline-none focus:border-primary dark:border-light/20 dark:bg-white/5 dark:focus:border-primary-dark"
            >
              {Object.entries(sorts).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
          {[null, ...tags].map((tag) => (
            <button
              key={tag ?? "all"}
              type="button"
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className="rounded-full border border-dark/15 px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-dark/40 aria-pressed:border-dark aria-pressed:bg-dark aria-pressed:text-light dark:border-light/15 dark:hover:border-light/40 dark:aria-pressed:border-light dark:aria-pressed:bg-light dark:aria-pressed:text-dark"
            >
              {tag ?? "All"}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "agent" : "agents"} shown
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-dark/20 p-12 text-center dark:border-light/20">
          <p className="text-lg font-semibold">No agents match that search.</p>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTag(null);
              }}
              className={`${buttonClass("secondary")} mt-4`}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {visible.map((agent) => (
              <motion.li
                key={agent.slug}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <AgentCard agent={agent}>
                  <button type="button" onClick={() => openDemo(agent.slug)} className={`${buttonClass("primary")} px-4 py-2 text-sm`}>
                    {agent.youtube_id ? "Watch demo" : "Preview"}
                  </button>
                  <HeartButton
                    name={agent.name}
                    count={agent.hearts_count}
                    liked={liked.has(agent.slug)}
                    onLike={() => like(agent.slug)}
                  />
                </AgentCard>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      <DemoModal
        agent={openAgent}
        liked={openAgent ? liked.has(openAgent.slug) : false}
        heartCount={openAgent ? heartCounts[openAgent.slug] ?? 0 : 0}
        onLike={() => openAgent && like(openAgent.slug)}
        onClose={closeDemo}
      />
    </>
  );
}
