import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ticket Scanner PWA",
  description: "QR code ticket scanning application",
  manifest: "/manifest.json",
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

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};