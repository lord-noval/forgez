'use client';

import { motion } from 'framer-motion';
import {
  UserCircle,
  Sparkles,
  BookOpen,
  Building2,
  Target,
  Award,
  Flame,
  Users,
  Check,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { QuestStatus } from '@/themes/types';

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

export interface QuestNode {
  number: number;
  title: string;
  status: QuestStatus;
  xpReward: number;
}

interface ProgressPathProps {
  quests: QuestNode[];
  currentQuest: number;
  animated?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProgressPath({
  quests,
  currentQuest,
  animated = true,
  compact = false,
  className,
}: ProgressPathProps) {
  const getStatusStyles = (status: QuestStatus, isCurrentQuest: boolean) => {
    if (status === 'completed') {
      return {
        node: 'bg-[var(--success)] border-[var(--success)] shadow-[0_0_20px_var(--success-muted)]',
        text: 'text-[var(--success)]',
        connector: 'bg-[var(--success)]',
        icon: 'text-white',
      };
    }
    if (status === 'in_progress' || (status === 'available' && isCurrentQuest)) {
      return {
        node: 'bg-[var(--primary)] border-[var(--primary)] shadow-[0_0_20px_var(--primary-muted)]',
        text: 'text-[var(--primary)]',
        connector: 'bg-[var(--border)]',
        icon: 'text-white',
      };
    }
    if (status === 'available') {
      return {
        node: 'bg-[var(--background-secondary)] border-[var(--border-hover)]',
        text: 'text-[var(--foreground-muted)]',
        connector: 'bg-[var(--border)]',
        icon: 'text-[var(--foreground-muted)]',
      };
    }
    // locked
    return {
      node: 'bg-[var(--background-tertiary)] border-[var(--border)]',
      text: 'text-[var(--foreground-muted)] opacity-50',
      connector: 'bg-[var(--border)]',
      icon: 'text-[var(--foreground-muted)] opacity-50',
    };
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {quests.map((quest, index) => {
          const styles = getStatusStyles(quest.status, quest.number === currentQuest);
          const QuestIcon = QUEST_ICONS[quest.number];
          const isClickable = quest.status !== 'locked';

          return (
            <div key={quest.number} className="flex items-center">
              <motion.div
                initial={animated ? { scale: 0 } : undefined}
                animate={animated ? { scale: 1 } : undefined}
                transition={{ delay: index * 0.05, type: 'spring' }}
              >
                {isClickable ? (
                  <Link href={`/quest/${quest.number}`}>
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110',
                        styles.node
                      )}
                    >
                      {quest.status === 'completed' ? (
                        <Check className={cn('w-4 h-4', styles.icon)} />
                      ) : quest.status === 'locked' ? (
                        <Lock className={cn('w-3 h-3', styles.icon)} />
                      ) : (
                        <span className={cn('text-xs font-bold', styles.icon)}>
                          {quest.number}
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center',
                      styles.node
                    )}
                  >
                    <Lock className={cn('w-3 h-3', styles.icon)} />
                  </div>
                )}
              </motion.div>

              {/* Connector */}
              {index < quests.length - 1 && (
                <motion.div
                  initial={animated ? { scaleX: 0 } : undefined}
                  animate={animated ? { scaleX: 1 } : undefined}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className={cn('w-4 h-0.5', styles.connector)}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {quests.map((quest, index) => {
        const styles = getStatusStyles(quest.status, quest.number === currentQuest);
        const QuestIcon = QUEST_ICONS[quest.number];
        const isClickable = quest.status !== 'locked';
        const isPulsing = quest.status === 'in_progress' || (quest.status === 'available' && quest.number === currentQuest);

        return (
          <div key={quest.number} className="flex flex-col">
            <motion.div
              initial={animated ? { opacity: 0, x: -20 } : undefined}
              animate={animated ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              {/* Quest Node */}
              {isClickable ? (
                <Link href={`/quest/${quest.number}`} className="flex-shrink-0">
                  <div
                    className={cn(
                      'w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-105',
                      styles.node,
                      isPulsing && 'animate-pulse'
                    )}
                  >
                    {quest.status === 'completed' ? (
                      <Check className={cn('w-6 h-6', styles.icon)} />
                    ) : (
                      QuestIcon && <QuestIcon className={cn('w-6 h-6', styles.icon)} />
                    )}
                  </div>
                </Link>
              ) : (
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl border-2 flex items-center justify-center flex-shrink-0',
                    styles.node
                  )}
                >
                  <Lock className={cn('w-5 h-5', styles.icon)} />
                </div>
              )}

              {/* Quest Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono', styles.text)}>
                    Quest {quest.number}
                  </span>
                  {quest.status === 'completed' && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--success-muted)] text-[var(--success)]">
                      Complete
                    </span>
                  )}
                  {isPulsing && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--primary-muted)] text-[var(--primary)]">
                      Current
                    </span>
                  )}
                </div>
                {isClickable ? (
                  <Link href={`/quest/${quest.number}`}>
                    <h3
                      className={cn(
                        'font-display font-semibold truncate hover:text-[var(--primary)] transition-colors',
                        quest.status === 'locked' && 'opacity-50'
                      )}
                    >
                      {quest.title}
                    </h3>
                  </Link>
                ) : (
                  <h3
                    className={cn(
                      'font-display font-semibold truncate opacity-50'
                    )}
                  >
                    {quest.title}
                  </h3>
                )}
                <p className={cn('text-xs', styles.text)}>
                  +{quest.xpReward} XP
                </p>
              </div>
            </motion.div>

            {/* Vertical Connector */}
            {index < quests.length - 1 && (
              <motion.div
                initial={animated ? { scaleY: 0 } : undefined}
                animate={animated ? { scaleY: 1 } : undefined}
                transition={{ delay: index * 0.1 + 0.1 }}
                className={cn(
                  'w-0.5 h-4 ml-7 origin-top',
                  quest.status === 'completed' ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressPath;
