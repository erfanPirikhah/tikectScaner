import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable output for static export
  output: "export",
  // serverExternalPackages moved to top level instead of experimental
  serverExternalPackages: ["sharp", "svgo"],
  // Images: since we're doing static export, we need to handle images properly
  images: {
    unoptimized: true, // This is important for static exports
  },
  // Remove any server-side features
  trailingSlash: true, // Optional: adds trailing slashes to URLs
};

// Export the config directly
export default nextConfig;
