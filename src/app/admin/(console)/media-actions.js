"use server";

import { randomUUID } from "crypto";
import { assertOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// SVG is deliberately excluded: it can carry scripts.
const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const MAX_BYTES = 5 * 1024 * 1024;

// Uploads one image to the public "media" bucket and returns its public URL.
// folder: "posts" | "covers" | "agents"
export async function uploadImage(formData) {
  await assertOwner();

  const file = formData.get("file");
  const folder = ["posts", "covers", "agents"].includes(formData.get("folder")) ? formData.get("folder") : "posts";

  if (!file || typeof file === "string") return { error: "No file received." };
  if (!TYPES[file.type]) return { error: "Use a PNG, JPEG, WebP, GIF or AVIF image." };
  if (file.size > MAX_BYTES) return { error: "Images must be 5 MB or smaller." };

  const path = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${TYPES[file.type]}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

  if (error) {
    console.error("media: upload failed", error.message);
    return { error: "Upload failed. Please try again." };
  }
  return { url: supabase.storage.from("media").getPublicUrl(path).data.publicUrl };
}
