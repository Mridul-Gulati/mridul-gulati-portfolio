import "server-only";
import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";

const VISITOR_COOKIE = "vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function saltedHash(value) {
  return createHash("sha256")
    .update(`${process.env.VISITOR_HASH_SALT ?? ""}:${value}`)
    .digest("hex");
}

// Salted hash of the client IP. The raw IP is never stored.
// Used for rate limiting (contact form, heart spam), not for identity.
export async function getIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return saltedHash(ip);
}

// Stable, privacy-safe visitor id: a random per-browser id in an httpOnly cookie, stored only
// as a salted hash. Pass { create: true } from a Server Action to issue the cookie if missing;
// otherwise returns null for first-time visitors.
export async function getVisitorHash({ create = false } = {}) {
  const store = await cookies();
  let id = store.get(VISITOR_COOKIE)?.value;

  if (!id) {
    if (!create) return null;
    id = randomUUID();
    store.set(VISITOR_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  return saltedHash(id);
}
