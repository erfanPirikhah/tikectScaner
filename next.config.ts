import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "svgo"],
};

// Apply PWA configuration in production
const config = process.env.NODE_ENV === "production" 
  ? withPWA({
      ...nextConfig,
      pwa: {
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: process.env.NODE_ENV === "development",
      },
    }) 
  : {
      ...nextConfig,
      pwa: {
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: true, // Always disable in development for easier debugging
      },
    };

export default config;
