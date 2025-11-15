import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket Scanner PWA",
  description: "QR code ticket scanning application",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    title: "Ticket Scanner PWA",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Ticket Scanner PWA",
    description: "QR code ticket scanning application",
    type: "website",
  },
};