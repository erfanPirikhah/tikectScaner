import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan Ticket | Ticket Scanner PWA",
  description: "Scan QR code tickets",
};

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}