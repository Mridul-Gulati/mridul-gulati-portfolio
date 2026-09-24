import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";

// Privacy-safe visitor fingerprint: a salted SHA-256 of the client IP. The raw IP is never stored.
// Used for contact-form rate limiting now, and one-heart-per-visitor in Phase 3.
export async function getVisitorHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(`${process.env.VISITOR_HASH_SALT ?? ""}:${ip}`)
    .digest("hex");
}
