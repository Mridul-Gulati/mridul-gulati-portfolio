import { Montserrat } from "next/font/google";
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
    <html lang="en">
      <body className={`${montserrat.variable} font-sans min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
