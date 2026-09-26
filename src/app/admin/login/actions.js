"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
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

// Generates a one-time login token server-side and emails the link via Resend.
// Deliberately not signInWithOtp: that relies on a PKCE verifier cookie written during this
// request and on Supabase's rate-limited mailer, which broke the link in production.
// The token alone can't sign anyone in: /auth/confirm also requires this browser's adm_pw cookie.
async function sendLink(email) {
  const seconds = await linkWait();
  if (seconds === Infinity) return { status: "error", message: UNAVAILABLE };
  if (seconds > 0) {
    return { status: "sent", at: Date.now(), retryAfter: seconds, message: `A link was sent recently. You can request another in ${wait(seconds)}.` };
  }

  const failed = { status: "sent", at: Date.now(), retryAfter: LIMITS.linkCooldownSeconds, message: "Couldn't send the email right now. Try again shortly." };
  try {
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email });
    if (error) {
      console.error("auth: generateLink failed", error.message);
      return failed;
    }

    const origin = (await headers()).get("origin") || siteUrl;
    const link = `${origin}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`;
    const sent = await sendEmail({
      to: email,
      subject: "Your admin login link",
      text: `Click to finish signing in to your site's admin:\n\n${link}\n\nIt only works in the browser where you entered your password, within 10 minutes.\nIf you didn't try to sign in, change your password.`,
      html: `<p>Click to finish signing in to your site's admin:</p><p><a href="${link}">Sign in to admin</a></p><p style="color:#666">It only works in the browser where you entered your password, within 10 minutes.<br>If you didn't try to sign in, change your password.</p>`,
    });
    if (!sent) return failed;
  } catch (err) {
    console.error("auth: sendLink error", err);
    return failed;
  }

  await record("link_sent", await getIpHash());
  return { status: "sent", at: Date.now(), retryAfter: LIMITS.linkCooldownSeconds, message: "Password accepted. We've emailed you a login link to finish signing in." };
}

// Step 1: email + password. On success, set the short-lived "password verified" cookie and
// email the magic link (step 2).
// Never throws: an unexpected error shows a message instead of crashing the page.
export async function loginWithPassword(_prev, formData) {
  try {
    return await passwordStep(formData);
  } catch (err) {
    console.error("auth: password step error", err);
    return { status: "error", message: UNAVAILABLE };
  }
}

async function passwordStep(formData) {
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
  try {
    const pw = await verifyToken((await cookies()).get(PW_COOKIE)?.value, "pw");
    if (!pw) return { status: "error", message: "Your session expired. Enter your password again." };
    return await sendLink(pw.e);
  } catch (err) {
    console.error("auth: resend error", err);
    return { status: "error", message: UNAVAILABLE };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(MFA_COOKIE);
  store.delete(PW_COOKIE);
  redirect("/admin/login");
}
