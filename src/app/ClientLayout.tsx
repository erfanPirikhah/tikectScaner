'use client';

import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';

export default function ClientLayout({ children }: { children: ReactNode }) {
  // Register service worker for PWA functionality
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  return (
    <>
      {children}
      <Toaster position="top-right" dir="rtl" />
    </>
  );
}