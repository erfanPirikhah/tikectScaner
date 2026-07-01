// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './ClientLayout';


export const metadata: Metadata = {
  title: "تخفیفان | پرتال کسب و کارها و پذیرندگان",
  description: "تخفیفان | پرتال کسب و کارها و پذیرندگان",
  manifest: "/manifest.json",
};


export const viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* لود کردن فایل کانفیگ قبل از اجرای برنامه */}
        <script src="/config.js"></script>
        
        <meta name="theme-color" content="#f8fafc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="iticket" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ALogo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ALogo.png" />
        <link rel="apple-touch-icon" href="/ALogo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}