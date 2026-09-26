// Absolute base URL for metadata, sitemap, RSS and magic-link redirects.
// Set NEXT_PUBLIC_SITE_URL in Vercel to the live URL (vercel.app now, custom domain later).
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
