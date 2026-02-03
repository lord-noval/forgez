'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  ChevronRight,
  UserCircle,
  BookOpen,
  Building2,
  Target,
  Award,
  Flame,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfettiExplosion } from './ConfettiExplosion';
import { cn } from '@/lib/utils';

interface QuestCompleteModalProps {
  show: boolean;
  questNumber: number;
  questTitle: string;
  xpEarned: number;
  flavorText?: string;
  onContinue?: () => void;
}

// Quest icons mapping
const QUEST_ICONS: Record<number, React.ElementType> = {
  1: UserCircle,
  2: Sparkles,
  3: BookOpen,
  4: Building2,
  5: Target,
  6: Award,
  7: Flame,
  8: Users,
};

export function QuestCompleteModal({
  show,
  questNumber,
  questTitle,
  xpEarned,
  flavorText,
  onContinue,
}: QuestCompleteModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);

  const QuestIcon = QUEST_ICONS[questNumber] || Trophy;

  useEffect(() => {
    if (show) {
      // Trigger confetti with a slight delay
      const confettiTimer = setTimeout(() => setShowConfetti(true), 200);

      // Animate XP counter
      const duration = 1500;
      const steps = 30;
      const increment = xpEarned / steps;
      let current = 0;
      const counterTimer = setInterval(() => {
        current += increment;
        if (current >= xpEarned) {
          setDisplayedXP(xpEarned);
          clearInterval(counterTimer);
        } else {
          setDisplayedXP(Math.floor(current));
        }
      }, duration / steps);

      return () => {
        clearTimeout(confettiTimer);
        clearInterval(counterTimer);
      };
    } else {
      setShowConfetti(false);
      setDisplayedXP(0);
    }
  }, [show, xpEarned]);

  return (
    <>
      <ConfettiExplosion
        show={showConfetti}
        intensity="epic"
        duration={3000}
        origin={{ x: 50, y: 40 }}
        onComplete={() => setShowConfetti(false)}
      />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="celebration-backdrop flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className={cn(
                'relative w-full max-w-md p-8 rounded-2xl',
                'bg-[var(--background-secondary)] border-2 border-[var(--achievement)]',
                'shadow-[0_0_60px_var(--achievement-muted)]'
              )}
            >
              {/* Quest icon with glow */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                className="flex justify-center mb-6"
              >
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br from-[var(--primary)] to-[var(--achievement)]',
                    'glow-epic'
                  )}
                >
                  <QuestIcon className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Quest number badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-2"
              >
                <span
                  className={cn(
                    'px-4 py-1 rounded-full text-xs font-mono uppercase tracking-wider',
                    'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]'
                  )}
                >
                  Quest {questNumber} Complete
                </span>
              </motion.div>

              {/* Quest title */}
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-2xl md:text-3xl font-display font-bold gradient-text-fire mb-4"
              >
                {questTitle}
              </motion.h2>

              {/* Flavor text */}
              {flavorText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-[var(--foreground-muted)] mb-6 italic"
                >
                  "{flavorText}"
                </motion.p>
              )}

              {/* XP Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className={cn(
                  'p-4 rounded-xl mb-6',
                  'bg-[var(--accent-muted)] border border-[var(--accent)]',
                  'text-center'
                )}
              >
                <p className="text-sm text-[var(--foreground-muted)] mb-1">XP Earned</p>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                  <span className="text-4xl font-display font-bold text-[var(--accent)]">
                    +{displayedXP}
                  </span>
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  onClick={onContinue}
                  className={cn(
                    'w-full py-6 text-lg font-display font-semibold',
                    'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
                    'hover:from-[var(--primary-hover)] hover:to-[var(--secondary-hover)]',
                    'shadow-[0_0_30px_var(--primary-muted)]'
                  )}
                >
                  Continue Journey
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Decorative corner elements */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--achievement)] opacity-50" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--achievement)] opacity-50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default QuestCompleteModal;
