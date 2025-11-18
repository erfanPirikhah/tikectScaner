'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
  deferredPrompt: Event | null;
  isInstallable: boolean;
  isInstalled: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is already installed
  useEffect(() => {
    // Check for standalone mode (iOS)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      // Check for similar modes in other platforms
      ('standalone' in window.navigator && (window.navigator as any).standalone === true);
    
    setIsInstalled(isStandalone);
  }, []);

  // Set up the beforeinstallprompt event listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const value: PWAContextType = {
    deferredPrompt,
    isInstallable: !!deferredPrompt && !isInstalled,
    isInstalled
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}