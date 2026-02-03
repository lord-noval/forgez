'use client';

import { useState, useEffect, useCallback } from 'react';

// Extend Window interface for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const DISMISS_STORAGE_KEY = 'elevate-pwa-dismiss-timestamp';
const DISMISS_COOLDOWN_DAYS = 7;

export interface UsePWAInstallReturn {
  /** Whether the install prompt can be shown (browser supports it and not dismissed recently) */
  canInstall: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the device is iOS (requires manual installation instructions) */
  isIOS: boolean;
  /** Whether the device is Android */
  isAndroid: boolean;
  /** Whether the device is mobile (iOS or Android) */
  isMobile: boolean;
  /** Whether the device is in standalone mode (already installed as PWA) */
  isStandalone: boolean;
  /** Trigger the native install prompt */
  promptInstall: () => Promise<boolean>;
  /** Dismiss the prompt (sets 7-day cooldown) */
  dismissPrompt: () => void;
  /** Whether the prompt was recently dismissed */
  isDismissed: boolean;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if running in standalone mode (already installed)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running as installed PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Check platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const android = /android/.test(userAgent);
    const mobile = ios || android || /mobile|tablet/.test(userAgent);

    setIsIOS(ios);
    setIsAndroid(android);
    setIsMobile(mobile);

    // Check dismiss cooldown
    const dismissTimestamp = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissTimestamp) {
      const dismissDate = new Date(parseInt(dismissTimestamp, 10));
      const now = new Date();
      const diffDays = (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      setIsDismissed(diffDays < DISMISS_COOLDOWN_DAYS);
    }
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger native install prompt
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (error) {
      console.error('Error prompting PWA install:', error);
    }

    return false;
  }, [deferredPrompt]);

  // Dismiss prompt with cooldown
  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  // Can install if:
  // - Device is mobile (not desktop)
  // - We have a deferred prompt (browser supports it) OR iOS (show manual instructions)
  // - Not already installed
  // - Not recently dismissed
  const canInstall = isMobile && (!isInstalled && !isStandalone && !isDismissed) && (!!deferredPrompt || isIOS);

  return {
    canInstall,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    isStandalone,
    promptInstall,
    dismissPrompt,
    isDismissed,
  };
}
