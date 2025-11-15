import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "اسکن بلیت | اسکنر بلیت PWA",
  description: "اسکن بلیت‌های کد QR",
};

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}