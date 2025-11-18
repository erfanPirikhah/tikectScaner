import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverExternalPackages moved to top level instead of experimental
  serverExternalPackages: ["sharp", "svgo"],
  // Explicitly set turbopack config to empty object to avoid conflicts
  turbopack: {},
};

// Export the config directly - we'll handle PWA through separate configuration
export default nextConfig;
