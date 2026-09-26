"use server";

import { revalidatePath } from "next/cache";
import { assertOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setHandled(formData) {
  await assertOwner();
  const { error } = await createAdminClient()
    .from("contact_submissions")
    .update({ handled: formData.get("handled") === "true" })
    .eq("id", String(formData.get("id")));
  if (error) console.error("contacts: update failed", error.message);
  revalidatePath("/admin", "layout");
}
