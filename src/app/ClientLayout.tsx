'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" dir="rtl" />
    </>
  );
}