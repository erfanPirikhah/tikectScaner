import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverExternalPackages moved to top level instead of experimental
  serverExternalPackages: ["sharp", "svgo"],
};

export default nextConfig;
