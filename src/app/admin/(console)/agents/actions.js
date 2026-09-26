"use server";

import { redirect } from "next/navigation";
import { assertOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SLUG_RE, parseTags, parseYouTubeId, revalidateAgents, slugify, str } from "@/lib/admin-helpers";

export async function saveAgent(_prev, formData) {
  await assertOwner();

  const id = str(formData, "id") || null;
  const name = str(formData, "name");
  const youtube = parseYouTubeId(str(formData, "youtube_id"));
  const values = {
    name,
    slug: str(formData, "slug") || slugify(name),
    persona: str(formData, "persona"),
    problem: str(formData, "problem"),
    description: str(formData, "description"),
    tags: parseTags(str(formData, "tags")),
    thumbnail: str(formData, "thumbnail") || null,
    demo_type: formData.get("demo_type") === "live" ? "live" : "video",
    youtube_id: youtube ?? null,
    published: formData.get("published") === "on",
  };

  const errors = {};
  if (!values.name) errors.name = "Name is required.";
  if (!SLUG_RE.test(values.slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";
  if (!values.persona) errors.persona = "Who is it for?";
  if (!values.problem) errors.problem = "Add a one-line problem statement.";
  if (values.problem.length > 220) errors.problem = "Keep it under 220 characters; it shows on the card.";
  if (youtube === undefined) errors.youtube_id = "Paste a YouTube link or the 11-character video id.";
  if (Object.keys(errors).length) {
    return { status: "error", errors, values: { ...values, youtube_id: str(formData, "youtube_id") } };
  }

  const supabase = createAdminClient();

  // New agents go to the end of the catalogue.
  if (!id) {
    const { data: last } = await supabase.from("agents").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    values.sort_order = (last?.sort_order ?? 0) + 10;
  }

  const { data, error } = id
    ? await supabase.from("agents").update(values).eq("id", id).select("id").single()
    : await supabase.from("agents").insert(values).select("id").single();

  if (error) {
    if (error.code === "23505") return { status: "error", errors: { slug: "Another agent already uses this slug." }, values };
    console.error("agents: save failed", error.message);
    return { status: "error", message: "Couldn't save the agent. Please try again.", values };
  }

  revalidateAgents();
  if (!id) redirect(`/admin/agents/${data.id}?saved=1`);
  return { status: "saved", message: values.published ? "Saved. It's live in the catalogue." : "Saved as hidden.", values };
}

// Swap sort_order with the neighbouring agent above or below.
export async function moveAgent(formData) {
  await assertOwner();
  const id = str(formData, "id");
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const supabase = createAdminClient();
  const { data: agents } = await supabase.from("agents").select("id, sort_order").order("sort_order");
  const index = agents.findIndex((a) => a.id === id);
  const neighbour = agents[direction === "up" ? index - 1 : index + 1];
  if (index === -1 || !neighbour) return;

  const current = agents[index];
  await supabase.from("agents").update({ sort_order: neighbour.sort_order }).eq("id", current.id);
  await supabase.from("agents").update({ sort_order: current.sort_order }).eq("id", neighbour.id);
  revalidateAgents();
}

export async function deleteAgent(formData) {
  await assertOwner();
  await createAdminClient().from("agents").delete().eq("id", str(formData, "id"));
  revalidateAgents();
  redirect("/admin/agents");
}
