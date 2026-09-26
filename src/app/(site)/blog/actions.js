"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function recordPostView(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return;
  const { error } = await createAdminClient().rpc("increment_post_views", { p_slug: slug });
  if (error) console.error("posts: view increment failed", error.message);
}
