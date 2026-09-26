import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MFA_COOKIE, hasAdminSession } from "@/lib/admin-session";

export function isOwnerEmail(email) {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  return Boolean(owner) && email?.trim().toLowerCase() === owner;
}

// The signed-in owner, or null. Requires BOTH a Supabase session for the owner (getUser()
// verifies it with Supabase, unlike getSession()) AND this browser's second-factor cookie,
// which is only issued when the magic link follows a correct password in the same browser.
export async function getOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const mfa = (await cookies()).get(MFA_COOKIE)?.value;
  return (await hasAdminSession(user, mfa)) ? user : null;
}

// For admin pages and layouts: redirect anyone who isn't the owner to the login page.
export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) redirect("/admin/login");
  return owner;
}

// For admin Server Actions, which are public HTTP endpoints: refuse unless the owner is signed in.
export async function assertOwner() {
  const owner = await getOwner();
  if (!owner) throw new Error("Unauthorized");
  return owner;
}
