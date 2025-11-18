'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PWAContextType {
  updateAvailable: boolean;
  isUpdating: boolean;
  updatePWA: () => void;
  deferredPrompt: Event | null;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [currentCacheVersion, setCurrentCacheVersion] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we only run client-side code after hydration
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    setIsClient(true);

    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.register('/sw.js');
          setRegistration(reg);

          // Check for updates immediately
          await checkForUpdates(reg);

          // Listen for service worker updates
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // When the controller changes, the new service worker is now active
            console.log('Service worker controller changed');
            if (updateAvailable && typeof window !== 'undefined') {
              window.location.reload();
            }
          });

          // Listen for waiting service worker
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update is available
                  console.log('New service worker installed');
                  setUpdateAvailable(true);

                  // Automatically trigger update
                  updatePWA();
                } else if (newWorker.state === 'installed' && !navigator.serviceWorker.controller) {
                  // New service worker is available but no active controller
                  // This means it's the first service worker installation
                  console.log('First service worker installation');
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    // Check for updates and get cache version
    const checkForUpdates = async (reg: ServiceWorkerRegistration) => {
      try {
        // Force check for updates
        await reg.update();

        // Ask service worker for its cache version
        if (reg.active) {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data && event.data.type === 'CACHE_VERSION') {
              setCurrentCacheVersion(event.data.version);
            }
          };

          // Send message to active service worker
          reg.active?.postMessage({ type: 'CHECK_UPDATE' }, [messageChannel.port2]);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Run service worker registration on the client side
    registerServiceWorker();

    // Check for updates periodically
    const intervalId = setInterval(async () => {
      if (registration) {
        await checkForUpdates(registration);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array for initial mount only

  const updatePWA = async () => {
    if (isUpdating || !isClient) return;

    setIsUpdating(true);

    try {
      if (registration && registration.waiting) {
        // Send SKIP_WAITING message to service worker
        console.log('Sending SKIP_WAITING message to service worker');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Wait a bit for the service worker to update
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1000);
      } else if (registration) {
        // No waiting worker, but we can still try to update
        console.log('No waiting service worker, checking for updates');
        await registration.update();
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating PWA:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Automatically update when the page loads if we detect an update
  useEffect(() => {
    if (typeof window === 'undefined' || !registration) return;

    // If we detect a service worker waiting, update immediately
    if (registration?.waiting) {
      console.log('Service worker is waiting, updating now');
      updatePWA();
    }
  }, [registration]);

  // Don't render anything if not on client side to avoid hydration issues
  if (!isClient) {
    return (
      <PWAContext.Provider value={{
        updateAvailable: false,
        isUpdating: false,
        updatePWA: () => {},
        deferredPrompt: null
      }}>
        {children}
      </PWAContext.Provider>
    );
  }

  const value = {
    updateAvailable,
    isUpdating,
    updatePWA,
    deferredPrompt
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};