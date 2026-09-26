import "server-only";

// Sends one email through Resend. Returns true on success; never throws.
// Until a domain is verified in Resend, the sender is onboarding@resend.dev and mail can only be
// delivered to the Resend account's own address (which is OWNER_EMAIL here).
export async function sendEmail({ to, subject, text, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("email: RESEND_API_KEY missing");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
        ...(html && { html }),
        ...(replyTo && { reply_to: replyTo }),
      }),
    });
    if (!res.ok) {
      console.error("email: Resend failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("email: Resend error", err);
    return false;
  }
}
