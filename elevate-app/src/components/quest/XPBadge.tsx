'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useRecentXP, useLevelProgress } from '@/stores/xp-store';
import { useEffect, useState } from 'react';

interface XPBadgeProps {
  xp: number;
  level: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function XPBadge({ xp, level, showProgress = true, size = 'md' }: XPBadgeProps) {
  const recentXP = useRecentXP();
  const levelProgress = useLevelProgress();
  const [showXPGain, setShowXPGain] = useState(false);

  useEffect(() => {
    if (recentXP && recentXP > 0) {
      setShowXPGain(true);
      const timer = setTimeout(() => setShowXPGain(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [recentXP]);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center ${sizeClasses[size]} rounded-full bg-[var(--background-secondary)] border border-[var(--border)] relative overflow-hidden`}
      >
        {/* Level indicator */}
        <div className="flex items-center gap-1">
          <span className="font-display font-bold text-[var(--accent)]">Lv.{level}</span>
        </div>

        <div className="w-px h-4 bg-[var(--border)]" />

        {/* XP display */}
        <div className="flex items-center gap-1">
          <Sparkles className={`${iconSizes[size]} text-[var(--accent)]`} />
          <span className="font-mono font-medium text-[var(--foreground)]">
            {xp.toLocaleString()}
          </span>
          <span className="text-[var(--foreground-muted)]">XP</span>
        </div>

        {/* Progress bar to next level */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--background-tertiary)]">
            <motion.div
              className="h-full progress-xp"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </div>

      {/* XP gain animation */}
      <AnimatePresence>
        {showXPGain && recentXP && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute -top-6 right-0 text-[var(--accent)] font-display font-bold text-sm"
          >
            +{recentXP} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
