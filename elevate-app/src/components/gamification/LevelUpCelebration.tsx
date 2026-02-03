'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, Star, Trophy, X } from 'lucide-react';
import { useXPStore } from '@/stores/xp-store';
import confetti from 'canvas-confetti';

export function LevelUpCelebration() {
  const t = useTranslations('common');
  const pendingLevelUp = useXPStore((state) => state.pendingLevelUp);
  const acknowledgeLevelUp = useXPStore((state) => state.acknowledgeLevelUp);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pendingLevelUp) {
      setIsVisible(true);

      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#F97316', '#EAB308', '#22D3EE', '#84CC16'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [pendingLevelUp]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      acknowledgeLevelUp();
    }, 300);
  };

  if (!pendingLevelUp) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-md"
            onClick={handleDismiss}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative z-10 flex flex-col items-center p-8 max-w-sm mx-4"
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--foreground-muted)]" />
            </button>

            {/* Animated stars */}
            <div className="relative mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 -m-8"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 45}deg) translateY(-60px)`,
                    }}
                  >
                    <Star
                      className="w-4 h-4 text-[var(--achievement)]"
                      fill="var(--achievement)"
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Level badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="level-badge glow-epic"
              >
                {pendingLevelUp.to}
              </motion.div>
            </div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold font-display gradient-text-fire mb-2"
            >
              {t('levelUp.title')}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-[var(--foreground-muted)] mb-4 text-center"
            >
              {t('levelUp.subtitle', { level: pendingLevelUp.to })}
            </motion.p>

            {/* From → To */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex flex-col items-center">
                <span className="text-xs text-[var(--foreground-muted)]">{t('levelUp.from')}</span>
                <span className="text-xl font-bold text-[var(--foreground-subtle)]">
                  {pendingLevelUp.from}
                </span>
              </div>
              <Sparkles className="w-6 h-6 text-[var(--accent)]" />
              <div className="flex flex-col items-center">
                <span className="text-xs text-[var(--foreground-muted)]">{t('levelUp.to')}</span>
                <span className="text-xl font-bold text-[var(--primary)]">
                  {pendingLevelUp.to}
                </span>
              </div>
            </motion.div>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-bold font-display shadow-lg hover:shadow-xl transition-shadow"
            >
              {t('buttons.continue')}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
