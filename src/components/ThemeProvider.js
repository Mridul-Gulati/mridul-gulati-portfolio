"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Adds/removes the "dark" class on <html> (matches the dark variant in globals.css),
// follows the OS preference by default, and avoids a flash of the wrong theme.
export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
