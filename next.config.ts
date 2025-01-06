import type { NextConfig } from "next";

// const basePath = process.env.NODE_ENV === 'production' ? '/atoma-dashboard' : '';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // basePath: basePath,
  // assetPrefix: basePath,
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
