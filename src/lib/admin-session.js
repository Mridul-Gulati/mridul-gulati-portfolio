// Signed, expiring tokens for the admin two-step login. Uses Web Crypto so it runs in both
// middleware (edge) and Node. Signed with ADMIN_SESSION_SECRET; fails closed if it's missing.
//
//   adm_pw  - set after the password step (10 min). Proves step 1 happened in this browser.
//   adm_mfa - set after the magic link is used with a valid adm_pw (12 h). Required for admin.

export const PW_COOKIE = "adm_pw";
export const MFA_COOKIE = "adm_mfa";
export const PW_TTL = 10 * 60;
export const MFA_TTL = 12 * 60 * 60;

const enc = new TextEncoder();

const toB64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64Url = (text) => atob(text.replace(/-/g, "+").replace(/_/g, "/"));

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  return value && value.length >= 32 ? value : null;
}

async function hmac(data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toB64Url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signToken(payload, ttlSeconds) {
  if (!secret()) throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters");
  const body = toB64Url(enc.encode(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })));
  return `${body}.${await hmac(body)}`;
}

// Returns the payload if the signature is valid and it hasn't expired, otherwise null.
export async function verifyToken(token, kind) {
  if (!token || !secret()) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, await hmac(body))) return null;
  try {
    const payload = JSON.parse(fromB64Url(body));
    if (payload.k !== kind || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // the magic link is a top-level navigation from the email, so lax cookies are sent
  path: "/",
  maxAge,
});

// True when the Supabase user is the owner AND this browser holds a valid second-factor cookie.
export async function hasAdminSession(user, mfaToken) {
  const owner = process.env.OWNER_EMAIL?.trim().toLowerCase();
  if (!user || !owner || user.email?.toLowerCase() !== owner) return false;
  const mfa = await verifyToken(mfaToken, "mfa");
  return Boolean(mfa) && mfa.u === user.id;
}
