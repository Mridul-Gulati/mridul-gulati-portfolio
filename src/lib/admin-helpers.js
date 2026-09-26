import "server-only";
import { revalidatePath } from "next/cache";

// Shared parsing and cache helpers for admin Server Actions.

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const str = (formData, key) => String(formData.get(key) ?? "").trim();

// "RAG, multi-agent , evals" -> ["RAG", "multi-agent", "evals"], de-duplicated.
export function parseTags(value) {
  return [...new Set(value.split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 12);
}

// Accepts a raw 11-character id or any common YouTube URL form.
export function parseYouTubeId(value) {
  if (!value) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
  return match?.[1] ?? undefined; // undefined = present but unparseable
}

// Refresh every public page that shows blog content.
export function revalidateBlog(slugs = []) {
  revalidatePath("/blog");
  for (const slug of slugs.filter(Boolean)) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
  revalidatePath("/admin", "layout");
}

// Refresh every public page that shows agents.
export function revalidateAgents() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin", "layout");
}
