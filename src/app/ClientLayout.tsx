'use client';

import { ReactNode } from 'react';
import ToastProvider from '@/components/ToastProvider';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}