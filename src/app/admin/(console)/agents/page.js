import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { buttonClass } from "@/components/ui";
import { AdminHeader, EmptyState, StatusPill, plural } from "../admin-ui";
import { moveAgent } from "./actions";

export const metadata = { title: "Agents" };
export const dynamic = "force-dynamic";

function MoveButton({ id, direction, disabled }) {
  return (
    <form action={moveAgent}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="direction" value={direction} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={`Move ${direction}`}
        className="flex size-8 items-center justify-center rounded-md border border-dark/15 text-sm hover:bg-dark/5 disabled:opacity-30 dark:border-light/15 dark:hover:bg-light/10"
      >
        {direction === "up" ? "↑" : "↓"}
      </button>
    </form>
  );
}

export default async function AdminAgentsPage() {
  const { data: agents } = await createAdminClient()
    .from("agents")
    .select("id, slug, name, persona, published, youtube_id, views, hearts_count, sort_order")
    .order("sort_order");

  return (
    <>
      <AdminHeader
        title="Agents"
        actions={
          <Link href="/admin/agents/new" className={`${buttonClass("primary")} px-4 py-2 text-sm`}>
            New agent
          </Link>
        }
      >
        Catalogue order matches this list (Featured sort). Hidden agents never appear publicly.
      </AdminHeader>

      {agents?.length ? (
        <ul className="divide-y divide-dark/10 rounded-2xl border border-dark/10 bg-white dark:divide-light/10 dark:border-light/10 dark:bg-white/5">
          {agents.map((agent, i) => (
            <li key={agent.id} className="flex items-center gap-4 px-4 py-3 sm:px-5">
              <div className="flex flex-col gap-1">
                <MoveButton id={agent.id} direction="up" disabled={i === 0} />
                <MoveButton id={agent.id} direction="down" disabled={i === agents.length - 1} />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/agents/${agent.id}`} className="font-semibold hover:underline">
                  {agent.name}
                </Link>
                <p className="truncate text-sm text-dark/60 dark:text-light/60">
                  {agent.persona} · {plural(agent.views, "view")} · {agent.hearts_count} ♥
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                {!agent.youtube_id && <StatusPill>No video</StatusPill>}
                <StatusPill tone={agent.published ? "live" : "draft"}>{agent.published ? "Live" : "Hidden"}</StatusPill>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>No agents yet.</EmptyState>
      )}
    </>
  );
}
