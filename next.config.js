/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/{repository-name}' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/{repository-name}/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 