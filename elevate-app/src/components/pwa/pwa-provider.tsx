'use client';

import { useEffect, useState } from 'react';
import { InstallPrompt } from './install-prompt';
import { registerServiceWorker } from '@/lib/pwa/register-sw';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isClient, setIsClient] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    setIsClient(true);

    registerServiceWorker({
      onSuccess: () => {
        console.log('[PWA] Service worker installed successfully');
      },
      onUpdate: () => {
        console.log('[PWA] New version available');
      },
      onError: (error) => {
        console.error('[PWA] Service worker registration failed:', error);
      },
    });
  }, []);

  return (
    <>
      {children}
      {/* Only render install prompt on client to avoid hydration issues */}
      {isClient && <InstallPrompt delay={3000} />}
    </>
  );
}
