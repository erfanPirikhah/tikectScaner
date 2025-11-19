import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '@/context/theme-provider';

export const metadata: Metadata = {
  title: "نرم افزار اختصاصی CheckIn بلیت",
  description: "نرم افزار اختصاصی CheckIn بلیت",
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
      </head>
      <body
        className="antialiased"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
