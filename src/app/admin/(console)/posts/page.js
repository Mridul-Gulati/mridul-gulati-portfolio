import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/posts";
import { buttonClass } from "@/components/ui";
import { AdminHeader, EmptyState, StatusPill, plural } from "../admin-ui";

export const metadata = { title: "Posts" };
export const dynamic = "force-dynamic";

function status(post) {
  if (post.status === "draft") return { tone: "draft", label: "Draft" };
  if (new Date(post.published_at) > new Date()) return { tone: "neutral", label: `Scheduled ${formatDate(post.published_at)}` };
  return { tone: "live", label: "Published" };
}

export default async function AdminPostsPage() {
  const { data: posts } = await createAdminClient()
    .from("posts")
    .select("id, slug, title, status, published_at, updated_at, views, tags")
    .order("updated_at", { ascending: false });

  return (
    <>
      <AdminHeader
        title="Posts"
        actions={
          <Link href="/admin/posts/new" className={`${buttonClass("primary")} px-4 py-2 text-sm`}>
            New post
          </Link>
        }
      >
        Drafts are private. Published posts appear on /blog immediately.
      </AdminHeader>

      {posts?.length ? (
        <ul className="divide-y divide-dark/10 rounded-2xl border border-dark/10 bg-white dark:divide-light/10 dark:border-light/10 dark:bg-white/5">
          {posts.map((post) => {
            const { tone, label } = status(post);
            return (
              <li key={post.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Link href={`/admin/posts/${post.id}`} className="font-semibold hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-sm text-dark/60 dark:text-light/60">
                    Edited {formatDate(post.updated_at)} · {plural(post.views, "view")}
                    {post.tags.length > 0 && ` · ${post.tags.join(", ")}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill tone={tone}>{label}</StatusPill>
                  {tone === "live" && (
                    <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm hover:underline">
                      View ↗
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState>
          No posts yet.{" "}
          <Link href="/admin/posts/new" className="font-semibold underline">
            Write the first one
          </Link>
          .
        </EmptyState>
      )}
    </>
  );
}
