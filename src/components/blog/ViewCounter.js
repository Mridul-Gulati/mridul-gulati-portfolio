"use client";

import { useEffect } from "react";
import { recordPostView } from "@/app/(site)/blog/actions";

// Counts one view per post per browser session. Renders nothing.
export default function ViewCounter({ slug }) {
  useEffect(() => {
    try {
      const key = `read:${slug}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable: count it anyway.
    }
    recordPostView(slug);
  }, [slug]);
  return null;
}
