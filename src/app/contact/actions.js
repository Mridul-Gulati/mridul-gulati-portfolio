"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getIpHash } from "@/lib/visitor";
import { requirementTypes } from "@/data/site";

const RATE_LIMIT = { max: 3, windowMinutes: 60 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  if (!values.name) errors.name = "Please enter your name.";
  else if (values.name.length > 100) errors.name = "Name is too long.";

  if (!EMAIL_RE.test(values.email) || values.email.length > 200)
    errors.email = "Please enter a valid email address.";

  if (values.company.length > 120) errors.company = "Company name is too long.";

  if (!requirementTypes.includes(values.requirement_type))
    errors.requirement_type = "Please choose what you need help with.";

  if (values.message.length < 20) errors.message = "Please add a little more detail (at least 20 characters).";
  else if (values.message.length > 5000) errors.message = "Message is too long (5,000 characters max).";

  return errors;
}

async function notifyOwner(values) {
  const { RESEND_API_KEY, OWNER_EMAIL } = process.env;
  if (!RESEND_API_KEY || !OWNER_EMAIL) {
    console.warn("contact: RESEND_API_KEY or OWNER_EMAIL missing; skipping email");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      reply_to: values.email,
      subject: `New enquiry: ${values.requirement_type} from ${values.name}`,
      text: [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Company: ${values.company || "-"}`,
        `Need: ${values.requirement_type}`,
        "",
        values.message,
      ].join("\n"),
    }),
  });

  if (!res.ok) console.error("contact: Resend failed", res.status, await res.text());
}

export async function submitContact(_prevState, formData) {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    requirement_type: String(formData.get("requirement_type") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
  };

  // Honeypot: real users never see or fill this field. Pretend success so bots don't retry.
  if (formData.get("website")) return { status: "success" };

  const errors = validate(values);
  if (Object.keys(errors).length) return { status: "error", errors, values };

  const supabase = createAdminClient();
  const ipHash = await getIpHash();

  const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
  const { count, error: countError } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (countError) console.error("contact: rate-limit check failed", countError.message);
  if (count >= RATE_LIMIT.max) {
    return {
      status: "error",
      message: "You've sent a few messages already. Please try again in an hour.",
      values,
    };
  }

  const { error } = await supabase
    .from("contact_submissions")
    .insert({ ...values, company: values.company || null, ip_hash: ipHash });

  if (error) {
    console.error("contact: insert failed", error.message);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again, or reach me on LinkedIn.",
      values,
    };
  }

  // The DB row is the source of truth; an email failure is logged but doesn't fail the submission.
  try {
    await notifyOwner(values);
  } catch (err) {
    console.error("contact: email error", err);
  }

  return { status: "success" };
}
