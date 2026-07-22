import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only SVG assets are used, so image optimization is left at the default (enabled).
  reactCompiler: true,
  cacheComponents: true,
  // Don't log server functions launch with args to console to avoid leaking login and password
  // logging: {
  //   serverFunctions: false,
  // },
};

export default nextConfig;
