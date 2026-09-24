import { Montserrat } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mridul Gulati | AI Engineer",
    template: "%s | Mridul Gulati",
  },
  description:
    "Production-grade agentic AI systems: multi-agent orchestration, evaluation, guardrails and observability.",
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <ThemeProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
