/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the project root; a stray lockfile higher up the tree otherwise confuses Next's inference.
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      // YouTube video thumbnails for agents without a custom thumbnail
      { protocol: "https", hostname: "i.ytimg.com" },
      // Custom thumbnails uploaded to Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
}

module.exports = nextConfig
