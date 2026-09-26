"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { assertOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getIpHash } from "@/lib/visitor";
import { passwordLockout, record } from "@/lib/login-guard";

const MIN_LENGTH = 12;

export async function changePassword(_prev, formData) {
  const owner = await assertOwner();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const ipHash = await getIpHash();

  const locked = await passwordLockout(ipHash);
  if (locked === Infinity) return { status: "error", message: "Temporarily unavailable. Try again shortly." };
  if (locked > 0) return { status: "error", message: "Too many attempts. Try again later." };
  if (next.length < MIN_LENGTH) return { status: "error", message: `Use at least ${MIN_LENGTH} characters.` };
  if (next !== confirm) return { status: "error", message: "The new passwords don't match." };
  if (next === current) return { status: "error", message: "Choose a password different from the current one." };

  // Re-check the current password with a throwaway client (doesn't touch this browser's session).
  const probe = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: wrong } = await probe.auth.signInWithPassword({ email: owner.email, password: current });
  if (wrong) {
    await record("password_fail", ipHash);
    return { status: "error", message: "Your current password is incorrect." };
  }
  await probe.auth.signOut({ scope: "local" });

  const { error } = await createAdminClient().auth.admin.updateUserById(owner.id, { password: next });
  if (error) {
    console.error("account: password update failed", error.message);
    return { status: "error", message: error.message.includes("weak") ? "That password is too weak." : "Couldn't update the password." };
  }
  return { status: "saved", message: "Password updated. Use it next time you sign in." };
}
