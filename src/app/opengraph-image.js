import { ogCard, ogSize } from "@/lib/og-card";

export const alt = "Mridul Gulati, AI Engineer: production-grade AI agents";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "AI Engineer · Agentic systems",
    title: "I build AI agents that run in production, not just in demos.",
  });
}
