/** @type {import('next').NextConfig} */

// next.config.js — Next.js configuration for Clavis
// This file controls how Next.js builds and serves your app.
const nextConfig = {
  // 'output: export' creates a static HTML export — no server needed.
  // This means Vercel can host it for free on their static CDN.
  output: 'export',

  // Disable the built-in image optimisation server (not needed for static export)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
