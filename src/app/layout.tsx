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
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f8fafc" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="iticket" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ALogo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ALogo.png" />
        <link rel="apple-touch-icon" href="/ALogo.png" />
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
            <div className="flex flex-col min-h-screen">
              <ClientLayout>{children}</ClientLayout>
              <AddToHomeScreenPrompt />
            </div>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
