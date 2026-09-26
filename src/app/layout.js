import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeProvider from "@/components/ThemeProvider";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const description =
  "AI engineer building production-grade agentic systems: multi-agent orchestration, evaluation, guardrails and observability.";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | AI Engineer`,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name, url: siteUrl }],
  // Canonical URLs are set per page (a root-level canonical would point every page at "/").
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name}'s blog` }] },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | AI Engineer`,
    description,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", title: `${site.name} | AI Engineer`, description },
};

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} flex min-h-screen flex-col font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
