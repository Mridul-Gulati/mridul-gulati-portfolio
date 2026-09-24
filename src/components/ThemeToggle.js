"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The theme is unknown during server render; render a same-size placeholder until mounted.
  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="block size-10" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-dark/5 dark:hover:bg-light/10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
