import "server-only";
import { createPublicClient } from "@/lib/supabase/public";

const LIST_FIELDS = "slug, title, excerpt, cover_image, tags, published_at, updated_at, views, body";

export function readingMinutes(body = "") {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// Published posts, newest first. RLS already hides drafts and future-dated posts.
// The body is fetched only to compute reading time, then dropped.
export async function getPublishedPosts({ limit } = {}) {
  let query = createPublicClient()
    .from("posts")
    .select(LIST_FIELDS)
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("posts: list failed", error.message);
    return [];
  }
  return data.map(({ body, ...post }) => ({ ...post, minutes: readingMinutes(body) }));
}

export async function getPublishedPost(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { data, error } = await createPublicClient()
    .from("posts")
    .select("slug, title, excerpt, body, cover_image, tags, published_at, updated_at, views")
    .eq("slug", slug)
    .maybeSingle();
  if (error) console.error("posts: fetch failed", error.message);
  return data ? { ...data, minutes: readingMinutes(data.body) } : null;
}
