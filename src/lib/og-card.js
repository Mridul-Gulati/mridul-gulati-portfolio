import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const ogSize = { width: 1200, height: 630 };

const TEAL = "#58E6D9";
const DARK = "#1b1b1b";

// A hollow wireframe cube (two offset squares joined at the corners), echoing the hero graphic.
function Cube() {
  const front = "M60 120 L240 120 L240 300 L60 300 Z";
  const back = "M140 40 L320 40 L320 220 L140 220 Z";
  const joins = "M60 120 L140 40 M240 120 L320 40 M240 300 L320 220 M60 300 L140 220";
  return (
    <svg width="380" height="340" viewBox="0 0 380 340" style={{ position: "absolute", right: 60, top: 150 }}>
      <path d={back} fill="none" stroke={TEAL} strokeOpacity="0.35" strokeWidth="2" />
      <path d={joins} fill="none" stroke={TEAL} strokeOpacity="0.6" strokeWidth="2" />
      <path d={front} fill="none" stroke={TEAL} strokeWidth="3" />
    </svg>
  );
}

// Branded 1200x630 social card used for the site and for each blog post.
export function ogCard({ eyebrow, title, footer }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: DARK,
          color: "#f5f5f5",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <Cube />
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: TEAL }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", maxWidth: 760, fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, color: "#c9c9c9" }}>
          <div style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: TEAL }} />
          {footer ?? `${site.name} · AI Engineer`}
        </div>
      </div>
    ),
    ogSize
  );
}
