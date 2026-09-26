import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/auth";
import { MFA_COOKIE, MFA_TTL, PW_COOKIE, cookieOptions, signToken, verifyToken } from "@/lib/admin-session";

// Step 2 of the admin login: the magic link lands here. Supports both Supabase link styles:
// - PKCE:       /auth/confirm?code=...                 (default email template)
// - token hash: /auth/confirm?token_hash=...&type=...  (custom template / admin-generated links)
// The link only completes the login if this browser also passed the password step (adm_pw cookie).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") || "magiclink";
  // Only ever redirect within the admin area.
  const next = searchParams.get("next")?.startsWith("/admin") ? searchParams.get("next") : "/admin";
  const fail = (reason) => NextResponse.redirect(`${origin}/admin/login?error=${reason}`);

  const store = await cookies();
  const pw = await verifyToken(store.get(PW_COOKIE)?.value, "pw");

  const supabase = await createClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { data: {}, error: new Error("missing code") };

  if (error) {
    console.error("auth: magic link failed", error.message);
    return fail("link");
  }

  const user = data?.user ?? data?.session?.user;
  // No password step in this browser (or for a different email): don't keep the session.
  if (!pw || !user || !isOwnerEmail(user.email) || pw.e !== user.email.toLowerCase()) {
    await supabase.auth.signOut();
    store.delete(PW_COOKIE);
    return fail("password");
  }

  store.set(MFA_COOKIE, await signToken({ k: "mfa", u: user.id }, MFA_TTL), cookieOptions(MFA_TTL));
  store.delete(PW_COOKIE);
  return NextResponse.redirect(`${origin}${next}`);
}
