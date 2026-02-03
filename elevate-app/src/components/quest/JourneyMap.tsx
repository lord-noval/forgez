'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Lock,
  UserCircle,
  Sparkles,
  BookOpen,
  Building2,
  Target,
  Award,
  Flame,
  Users,
} from 'lucide-react';
import { QUESTS, useQuestStore } from '@/stores/quest-store';
import { cn } from '@/lib/utils';

interface JourneyMapProps {
  animated?: boolean;
  compact?: boolean;
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

export function JourneyMap({
  animated = true,
  compact = false,
  className,
}: JourneyMapProps) {
  const questProgress = useQuestStore((state) => state.questProgress);
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      className={cn(
        'p-4 rounded-xl',
        'bg-[var(--background-secondary)] border border-[var(--border)]',
        className
      )}
    >
      {/* Title */}
      {!compact && (
        <h3 className="text-sm font-display font-semibold text-[var(--foreground-muted)] mb-4 text-center">
          Your Journey
        </h3>
      )}

      {/* Quest nodes - horizontal on desktop, grid on mobile */}
      <div className={cn(
        'flex items-center justify-between gap-1 overflow-x-auto no-scrollbar',
        compact ? 'py-1' : 'py-2'
      )}>
        {QUESTS.map((quest, index) => {
          const progress = questProgress.find((qp) => qp.questNumber === quest.number);
          const status = progress?.status || 'locked';
          const isCompleted = status === 'completed';
          const isCurrent = quest.number === currentQuestNumber;
          const isLocked = status === 'locked';
          const xpEarned = progress?.xpEarned || 0;

          const QuestIcon = QUEST_ICONS[quest.number] || Sparkles;

          return (
            <div key={quest.number} className="flex items-center">
              {/* Quest node */}
              <motion.div
                initial={animated ? { scale: 0 } : undefined}
                animate={animated ? { scale: 1 } : undefined}
                transition={{ delay: index * 0.05 }}
                className="relative flex flex-col items-center"
              >
                {/* Node circle */}
                <div
                  className={cn(
                    'relative flex items-center justify-center rounded-full',
                    'transition-all duration-300',
                    compact ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12',
                    isCompleted && 'bg-[var(--success)] text-white',
                    isCurrent && 'bg-[var(--primary)] text-white',
                    isLocked && 'bg-[var(--background-tertiary)] text-[var(--foreground-subtle)]',
                    !isCompleted && !isCurrent && !isLocked && 'bg-[var(--primary-muted)] text-[var(--primary)]'
                  )}
                >
                  {isCompleted ? (
                    <Check className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
                  ) : isLocked ? (
                    <Lock className={cn(compact ? 'w-3 h-3' : 'w-4 h-4')} />
                  ) : (
                    <QuestIcon className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />
                  )}

                  {/* Pulse ring for current quest */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[var(--primary)]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* Glow for completed/current */}
                  {(isCompleted || isCurrent) && (
                    <div
                      className={cn(
                        'absolute inset-0 rounded-full -z-10',
                        isCompleted && 'shadow-[0_0_15px_var(--success-muted)]',
                        isCurrent && 'shadow-[0_0_20px_var(--primary-muted)]'
                      )}
                    />
                  )}
                </div>

                {/* Quest number / XP */}
                {!compact && (
                  <div className="mt-1 text-center">
                    <span
                      className={cn(
                        'text-[10px] font-mono',
                        isCompleted && 'text-[var(--success)]',
                        isCurrent && 'text-[var(--primary)]',
                        isLocked && 'text-[var(--foreground-subtle)]'
                      )}
                    >
                      {isCompleted && xpEarned > 0 ? `+${xpEarned}` : quest.number}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Connecting line */}
              {index < QUESTS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 mx-0.5 md:mx-1',
                    compact ? 'w-3 md:w-4' : 'w-4 md:w-8'
                  )}
                >
                  <motion.div
                    initial={animated ? { scaleX: 0 } : undefined}
                    animate={animated ? { scaleX: 1 } : undefined}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className={cn(
                      'h-full origin-left rounded-full transition-colors duration-300',
                      isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress summary */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
          <span className="text-[var(--foreground-muted)]">
            {questProgress.filter((qp) => qp.status === 'completed').length} of {QUESTS.length} completed
          </span>
          <span className="text-[var(--accent)] font-semibold">
            +{questProgress.reduce((sum, qp) => sum + qp.xpEarned, 0)} XP
          </span>
        </div>
      )}
    </motion.div>
  );
}

export default JourneyMap;
