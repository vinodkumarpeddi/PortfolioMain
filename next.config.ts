import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
  experimental: {
    optimizePackageImports: ["motion", "gsap"],
  },
};

export default nextConfig;
