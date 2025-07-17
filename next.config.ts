import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // !! WARN !! 
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable static optimization for pages that require database access
  experimental: {
    // This prevents Next.js from statically generating pages that need database access
    workerThreads: false,
    cpus: 1
  },
  // Disable static generation for all pages
  staticPageGenerationTimeout: 0,
};

export default nextConfig;
