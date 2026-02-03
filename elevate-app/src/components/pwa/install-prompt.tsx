'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hammer,
  Zap,
  Home,
  WifiOff,
  Sparkles,
  X,
  Share,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useWorldTheme } from '@/stores/world-store';

// FORGE-Z themed content
const forgeZContent = {
  tagline: 'Forge Your Career Path',
  cta: 'Install FORGE-Z',
  Icon: Hammer,
};

// Feature list items
const features = [
  { icon: Home, text: 'Instant access from home screen' },
  { icon: WifiOff, text: 'Works offline' },
  { icon: Sparkles, text: 'Faster loading' },
  { icon: Zap, text: 'Native app feel' },
];

interface InstallPromptProps {
  delay?: number;
}

export function InstallPrompt({ delay = 3000 }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { canInstall, isIOS, promptInstall, dismissPrompt } = usePWAInstall();
  const theme = useWorldTheme();

  const content = forgeZContent;
  const WorldIcon = content.Icon;

  // Show prompt after delay
  useEffect(() => {
    if (!canInstall) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [canInstall, delay]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  if (!canInstall || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-[var(--background)]/95 via-[var(--background)]/98 to-[var(--background)]"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 20%, ${theme.colors.primary}15 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.colors.secondary}15 0%, transparent 50%)`,
            }}
            onClick={handleDismiss}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl"
          >
            {/* Animated gradient border */}
            <div
              className="absolute inset-0 rounded-2xl p-[2px]"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.primary})`,
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease infinite',
              }}
            >
              <div className="h-full w-full rounded-2xl bg-[var(--background-secondary)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-6">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 rounded-full p-2 text-[var(--foreground-muted)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* App icon with glow */}
              <div className="mb-6 flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 blur-xl opacity-50"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  {/* Icon container */}
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    }}
                  >
                    <WorldIcon className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
              </div>

              {/* Title and tagline */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 text-center"
              >
                <h2 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
                  Install FORGE-Z
                </h2>
                <p
                  className="text-lg font-medium"
                  style={{ color: theme.colors.primary }}
                >
                  {content.tagline}
                </p>
              </motion.div>

              {/* iOS-specific instructions */}
              {isIOS ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 rounded-xl bg-[var(--background-tertiary)] p-4"
                >
                  <p className="mb-4 text-sm text-[var(--foreground-muted)]">
                    To install on your device:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/20">
                        <span className="text-sm font-bold text-[var(--primary)]">1</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <span>Tap the</span>
                        <Share className="h-4 w-4" />
                        <span>Share button</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/20">
                        <span className="text-sm font-bold text-[var(--primary)]">2</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <span>Select</span>
                        <Plus className="h-4 w-4" />
                        <span>Add to Home Screen</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Features list for non-iOS */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6 grid grid-cols-2 gap-3"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-2 rounded-lg bg-[var(--background-tertiary)] p-3"
                    >
                      <feature.icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: theme.colors.primary }}
                      />
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                {!isIOS && (
                  <Button
                    onClick={handleInstall}
                    size="lg"
                    className="relative w-full overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    }}
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ translateX: ['calc(-100%)', 'calc(100%)'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <span className="relative z-10 font-semibold">{content.cta}</span>
                  </Button>
                )}
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="lg"
                  className="w-full text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  Maybe Later
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Keyframes for gradient animation */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}
