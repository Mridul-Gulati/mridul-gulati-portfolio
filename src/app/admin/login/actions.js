"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/auth";
import { getIpHash } from "@/lib/visitor";
import { siteUrl } from "@/lib/site-url";
import { LIMITS, linkWait, passwordLockout, record } from "@/lib/login-guard";
import { MFA_COOKIE, PW_COOKIE, PW_TTL, cookieOptions, signToken, verifyToken } from "@/lib/admin-session";

const UNAVAILABLE = "Sign-in is temporarily unavailable. Please try again shortly.";

const wait = (seconds) =>
  seconds >= 90 ? `${Math.ceil(seconds / 60)} minutes` : `${seconds} second${seconds === 1 ? "" : "s"}`;

// Step 1 check. Uses a throwaway, non-persisting client so a correct password does NOT create
// a usable session in this browser; only the magic link (step 2) does.
async function passwordIsCorrect(email, password) {
  const probe = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await probe.auth.signInWithPassword({ email, password });
  if (error) return false;
  await probe.auth.signOut({ scope: "local" }); // revoke just this probe session
  return true;
}

async function sendLink(email) {
  const seconds = await linkWait();
  if (seconds === Infinity) return { status: "error", message: UNAVAILABLE };
  if (seconds > 0) {
    return { status: "sent", at: Date.now(), retryAfter: seconds, message: `A link was sent recently. You can request another in ${wait(seconds)}.` };
  }

  const origin = (await headers()).get("origin") || siteUrl;
  const supabase = await createClient(); // cookie-aware: stores the PKCE verifier for step 2
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/confirm?next=/admin` },
  });
  if (error) {
    console.error("auth: signInWithOtp failed", error.message);
    return { status: "sent", at: Date.now(), retryAfter: LIMITS.linkCooldownSeconds, message: "Couldn't send the email right now. Try again shortly." };
  }

  await record("link_sent", await getIpHash());
  return { status: "sent", at: Date.now(), retryAfter: LIMITS.linkCooldownSeconds, message: "Password accepted. We've emailed you a login link to finish signing in." };
}

// Step 1: email + password. On success, set the short-lived "password verified" cookie and
// email the magic link (step 2).
export async function loginWithPassword(_prev, formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const ipHash = await getIpHash();

  const locked = await passwordLockout(ipHash);
  if (locked === Infinity) return { status: "error", message: UNAVAILABLE };
  if (locked > 0) return { status: "error", message: `Too many attempts. Try again in ${wait(locked)}.` };

  // Same message for a wrong email or a wrong password, so the form doesn't reveal the admin email.
  if (!isOwnerEmail(email) || !password || !(await passwordIsCorrect(email, password))) {
    await record("password_fail", ipHash);
    return { status: "error", message: "Email or password is incorrect." };
  }

  const token = await signToken({ k: "pw", e: email.toLowerCase() }, PW_TTL);
  (await cookies()).set(PW_COOKIE, token, cookieOptions(PW_TTL));
  return sendLink(email);
}

// Resend the magic link. Only works within 10 minutes of a correct password in this browser.
export async function resendLink() {
  const pw = await verifyToken((await cookies()).get(PW_COOKIE)?.value, "pw");
  if (!pw) return { status: "error", message: "Your session expired. Enter your password again." };
  return sendLink(pw.e);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(MFA_COOKIE);
  store.delete(PW_COOKIE);
  redirect("/admin/login");
}
