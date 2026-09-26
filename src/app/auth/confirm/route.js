import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOwnerEmail } from "@/lib/auth";
import { MFA_COOKIE, MFA_TTL, PW_COOKIE, cookieOptions, signToken, verifyToken } from "@/lib/admin-session";

// Step 2 of the admin login: the emailed link lands here as
//   /auth/confirm?token_hash=...&type=magiclink
// (the token is generated server-side in src/app/admin/login/actions.js). It only completes the
// login if this browser also passed the password step (valid adm_pw cookie for the same email).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") === "email" ? "email" : "magiclink";
  const fail = (reason) => NextResponse.redirect(`${origin}/admin/login?error=${reason}`);

  const store = await cookies();
  const pw = await verifyToken(store.get(PW_COOKIE)?.value, "pw");

  // Check the password step BEFORE using the one-time token, so opening the link in the wrong
  // browser doesn't burn it: you can still open the same email in the right browser.
  if (!pw) return fail("password");
  if (!tokenHash) return fail("link");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    console.error("auth: magic link failed", error.message);
    return fail("link");
  }

  const user = data?.user ?? data?.session?.user;
  if (!user || !isOwnerEmail(user.email) || pw.e !== user.email.toLowerCase()) {
    await supabase.auth.signOut();
    store.delete(PW_COOKIE);
    return fail("password");
  }

  store.set(MFA_COOKIE, await signToken({ k: "mfa", u: user.id }, MFA_TTL), cookieOptions(MFA_TTL));
  store.delete(PW_COOKIE);
  return NextResponse.redirect(`${origin}/admin`);
}
