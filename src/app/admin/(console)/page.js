import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/posts";
import { buttonClass } from "@/components/ui";
import { AdminHeader, EmptyState, StatusPill, plural } from "./admin-ui";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

async function count(query) {
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const db = createAdminClient();
  const head = { count: "exact", head: true };

  const [published, drafts, liveAgents, allAgents, unhandled, recent, topAgents, topPosts] = await Promise.all([
    count(db.from("posts").select("id", head).eq("status", "published")),
    count(db.from("posts").select("id", head).eq("status", "draft")),
    count(db.from("agents").select("id", head).eq("published", true)),
    count(db.from("agents").select("id", head)),
    count(db.from("contact_submissions").select("id", head).eq("handled", false)),
    db.from("contact_submissions").select("id, name, company, requirement_type, created_at, handled").order("created_at", { ascending: false }).limit(5),
    db.from("agents").select("name, views, hearts_count").eq("published", true).order("views", { ascending: false }).limit(5),
    db.from("posts").select("title, views").eq("status", "published").order("views", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Published posts", value: published, sub: `${drafts} draft${drafts === 1 ? "" : "s"}`, href: "/admin/posts" },
    { label: "Agents live", value: liveAgents, sub: `of ${allAgents} total`, href: "/admin/agents" },
    { label: "New enquiries", value: unhandled, sub: "not yet handled", href: "/admin/contacts" },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        actions={
          <>
            <Link href="/admin/posts/new" className={`${buttonClass("primary")} px-4 py-2 text-sm`}>
              New post
            </Link>
            <Link href="/admin/agents/new" className={`${buttonClass("secondary")} px-4 py-2 text-sm`}>
              New agent
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, sub, href }) => (
          <Link key={label} href={href} className="rounded-2xl border border-dark/10 bg-white p-5 transition-colors hover:border-dark/30 dark:border-light/10 dark:bg-white/5 dark:hover:border-light/30">
            <p className="text-sm text-dark/70 dark:text-light/70">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
            <p className="text-sm text-dark/60 dark:text-light/60">{sub}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold">Latest enquiries</h2>
        {recent.data?.length ? (
          <ul className="divide-y divide-dark/10 rounded-2xl border border-dark/10 bg-white dark:divide-light/10 dark:border-light/10 dark:bg-white/5">
            {recent.data.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {c.name}
                    {c.company && <span className="font-normal text-dark/60 dark:text-light/60"> · {c.company}</span>}
                  </p>
                  <p className="text-sm text-dark/60 dark:text-light/60">
                    {c.requirement_type} · {formatDate(c.created_at)}
                  </p>
                </div>
                <StatusPill tone={c.handled ? "neutral" : "live"}>{c.handled ? "Handled" : "New"}</StatusPill>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No enquiries yet.</EmptyState>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Most viewed agents</h2>
          <RankList rows={topAgents.data?.map((a) => [a.name, `${plural(a.views, "view")} · ${a.hearts_count} ♥`])} />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">Most read posts</h2>
          <RankList rows={topPosts.data?.map((p) => [p.title, plural(p.views, "view")])} />
        </section>
      </div>
    </>
  );
}

function RankList({ rows }) {
  if (!rows?.length) return <EmptyState>Nothing to show yet.</EmptyState>;
  return (
    <ol className="divide-y divide-dark/10 rounded-2xl border border-dark/10 bg-white dark:divide-light/10 dark:border-light/10 dark:bg-white/5">
      {rows.map(([name, detail]) => (
        <li key={name} className="flex items-center justify-between gap-4 px-5 py-3">
          <span className="truncate font-medium">{name}</span>
          <span className="shrink-0 text-sm text-dark/60 dark:text-light/60">{detail}</span>
        </li>
      ))}
    </ol>
  );
}
