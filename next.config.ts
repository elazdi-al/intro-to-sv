import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during builds  
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
