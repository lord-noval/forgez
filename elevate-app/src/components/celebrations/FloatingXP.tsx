'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingXPProps {
  amount: number;
  show: boolean;
  position?: { x: number; y: number };
  variant?: 'default' | 'bonus' | 'achievement';
  onComplete?: () => void;
}

const variantStyles: Record<string, { color: string; glow: string }> = {
  default: {
    color: 'text-[var(--accent)]',
    glow: 'shadow-[0_0_20px_var(--accent-muted)]',
  },
  bonus: {
    color: 'text-[var(--success)]',
    glow: 'shadow-[0_0_20px_var(--success-muted)]',
  },
  achievement: {
    color: 'text-[var(--achievement)]',
    glow: 'shadow-[0_0_25px_var(--achievement-muted)]',
  },
};

export function FloatingXP({
  amount,
  show,
  position = { x: 50, y: 50 },
  variant = 'default',
  onComplete,
}: FloatingXPProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            x: '-50%',
            y: 0,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            y: -60,
          }}
          exit={{
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: 1.2,
            ease: [0.4, 0, 0.2, 1],
            times: [0, 0.2, 0.7, 1],
          }}
          className={cn(
            'fixed z-[110] pointer-events-none',
            'px-4 py-2 rounded-full',
            'bg-[var(--background-secondary)] border border-[var(--border)]',
            'font-display font-bold text-lg',
            styles.color,
            styles.glow
          )}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingXP;
