import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '@/context/theme-provider';
import { PWAProvider } from '@/context/PWAContext';
import AddToHomeScreenPrompt from '@/components/AddToHomeScreenPrompt';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"], // Using available subsets that support extended characters
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"], // Using available subsets that support extended characters
});

export const metadata: Metadata = {
  title: "اسکنر بلیت PWA",
  description: "برنامه اسکن بلیت کد QR",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="itiket" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ALogo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ALogo.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v31.0.0/dist/font-face.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PWAProvider>
            <ClientLayout>{children}</ClientLayout>
            <AddToHomeScreenPrompt />
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
