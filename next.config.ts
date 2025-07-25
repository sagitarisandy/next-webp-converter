import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
