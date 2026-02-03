'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  UserCircle,
  BookOpen,
  Building2,
  Target,
  Award,
  Flame,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuestIntroCardProps {
  questNumber: number;
  title: string;
  intro: string;
  actionLabel?: string;
  xpReward?: number;
  onAction?: () => void;
  animated?: boolean;
  className?: string;
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

export function QuestIntroCard({
  questNumber,
  title,
  intro,
  actionLabel = 'Begin',
  xpReward,
  onAction,
  animated = true,
  className,
}: QuestIntroCardProps) {
  const QuestIcon = QUEST_ICONS[questNumber] || Sparkles;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 30, scale: 0.95 } : undefined}
      animate={animated ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'relative p-6 md:p-8 rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)]',
        'border border-[var(--border)]',
        className
      )}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, var(--primary) 0%, transparent 50%),
                           radial-gradient(circle at 70% 80%, var(--secondary) 0%, transparent 50%)`,
        }}
      />

      {/* Decorative corners */}
      <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[var(--primary)] opacity-40" />
      <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[var(--primary)] opacity-40" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[var(--secondary)] opacity-40" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[var(--secondary)] opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Quest number badge */}
        <motion.div
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={{ delay: 0.2, type: 'spring', damping: 10 }}
          className="mb-4"
        >
          <span
            className={cn(
              'inline-block px-4 py-1 rounded-full',
              'text-xs font-mono uppercase tracking-widest',
              'bg-[var(--primary-muted)] text-[var(--primary)]',
              'border border-[var(--primary)]'
            )}
          >
            Quest {questNumber}
          </span>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { scale: 1, rotate: 0 } : undefined}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
          className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center mb-6',
            'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]',
            'shadow-[0_0_40px_var(--primary-muted)]'
          )}
        >
          <QuestIcon className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl font-display font-bold gradient-text-fire mb-4"
        >
          {title}
        </motion.h2>

        {/* Intro text */}
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.5 }}
          className="text-[var(--foreground-muted)] max-w-md mb-6 italic"
        >
          "{intro}"
        </motion.p>

        {/* XP Badge */}
        {xpReward && (
          <motion.div
            initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ delay: 0.6 }}
            className={cn(
              'px-4 py-2 rounded-full mb-6',
              'bg-[var(--accent-muted)] border border-[var(--accent)]',
              'text-sm font-semibold text-[var(--accent)]'
            )}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Up to +{xpReward} XP
          </motion.div>
        )}

        {/* Action button */}
        {onAction && (
          <motion.div
            initial={animated ? { opacity: 0, y: 10 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={onAction}
              size="lg"
              className={cn(
                'px-8 py-6 text-lg font-display font-semibold',
                'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
                'hover:from-[var(--primary-hover)] hover:to-[var(--secondary-hover)]',
                'shadow-[0_0_30px_var(--primary-muted)]',
                'transition-all duration-300'
              )}
            >
              {actionLabel}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Animated glow border */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 0 1px var(--border)',
            '0 0 20px 1px var(--primary-muted)',
            '0 0 0 1px var(--border)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

export default QuestIntroCard;
