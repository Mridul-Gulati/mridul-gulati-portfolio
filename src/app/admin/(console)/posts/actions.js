"use server";

import { redirect } from "next/navigation";
import { assertOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SLUG_RE, parseTags, revalidateBlog, slugify, str } from "@/lib/admin-helpers";

export async function savePost(_prev, formData) {
  await assertOwner();

  const id = str(formData, "id") || null;
  const title = str(formData, "title");
  const values = {
    title,
    slug: str(formData, "slug") || slugify(title),
    excerpt: str(formData, "excerpt"),
    body: String(formData.get("body") ?? ""),
    cover_image: str(formData, "cover_image") || null,
    tags: parseTags(str(formData, "tags")),
    status: formData.get("status") === "published" ? "published" : "draft",
    published_at: str(formData, "published_at") ? new Date(str(formData, "published_at")).toISOString() : null,
  };

  const errors = {};
  if (!values.title) errors.title = "Title is required.";
  if (values.title.length > 200) errors.title = "Keep the title under 200 characters.";
  if (!SLUG_RE.test(values.slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  if (values.excerpt.length > 400) errors.excerpt = "Keep the excerpt under 400 characters.";
  if (values.status === "published" && !values.body.trim()) errors.body = "A published post needs a body.";
  if (Object.keys(errors).length) return { status: "error", errors, values };

  // Publishing without a date means "now".
  if (values.status === "published" && !values.published_at) values.published_at = new Date().toISOString();

  const supabase = createAdminClient();
  const previousSlug = id
    ? (await supabase.from("posts").select("slug").eq("id", id).maybeSingle()).data?.slug
    : null;

  const { data, error } = id
    ? await supabase.from("posts").update(values).eq("id", id).select("id").single()
    : await supabase.from("posts").insert(values).select("id").single();

  if (error) {
    if (error.code === "23505") return { status: "error", errors: { slug: "Another post already uses this slug." }, values };
    console.error("posts: save failed", error.message);
    return { status: "error", message: "Couldn't save the post. Please try again.", values };
  }

  revalidateBlog([values.slug, previousSlug]);
  if (!id) redirect(`/admin/posts/${data.id}?saved=1`);
  return { status: "saved", message: values.status === "published" ? "Saved and published." : "Draft saved.", values };
}

export async function deletePost(formData) {
  await assertOwner();
  const id = str(formData, "id");
  const supabase = createAdminClient();
  const { data } = await supabase.from("posts").delete().eq("id", id).select("slug").maybeSingle();
  revalidateBlog([data?.slug]);
  redirect("/admin/posts");
}
