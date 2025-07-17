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
  // Completely disable static generation
  staticPageGenerationTimeout: 180, // 3 minutes timeout
  // Use server-side rendering for all pages
  experimental: {
    // Disable static optimization
    workerThreads: false,
    cpus: 1,
    // Force dynamic rendering
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Force dynamic rendering for all pages
  generateEtags: false,
};

export default nextConfig;
