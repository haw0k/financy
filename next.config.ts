import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
  // Don't log server functions launch with args to console to avoid leaking login and password
  // logging: {
  //   serverFunctions: false,
  // },
};

export default nextConfig
