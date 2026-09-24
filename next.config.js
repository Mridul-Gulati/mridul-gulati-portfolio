/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the project root; a stray lockfile higher up the tree otherwise confuses Next's inference.
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
