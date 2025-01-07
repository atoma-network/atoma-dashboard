import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/atoma-dashboard',
  assetPrefix: '/atoma-dashboard/',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
