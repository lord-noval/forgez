'use client';

import { motion } from 'framer-motion';
import { useQuestStore, QUESTS } from '@/stores/quest-store';
import { Check, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cyan flame animation component for completed quests
function CyanFlame({ size = 'normal' }: { size?: 'normal' | 'small' }) {
  const flameCount = size === 'small' ? 3 : 5;
  const baseHeight = size === 'small' ? 12 : 20;

  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="relative flex items-end justify-center gap-0.5">
        {Array.from({ length: flameCount }).map((_, i) => {
          const delay = i * 0.1;
          const height = baseHeight - Math.abs(i - Math.floor(flameCount / 2)) * 4;

          return (
            <motion.div
              key={i}
              className="relative"
              style={{ height: height + 8 }}
            >
              {/* Main flame */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: size === 'small' ? 4 : 6,
                  background: `linear-gradient(to top, var(--accent), rgba(34, 211, 238, 0.6), transparent)`,
                  filter: 'blur(1px)',
                }}
                animate={{
                  height: [height, height + 6, height - 2, height + 4, height],
                  opacity: [0.9, 1, 0.8, 1, 0.9],
                  scaleX: [1, 1.2, 0.9, 1.1, 1],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
              {/* Inner bright core */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: size === 'small' ? 2 : 3,
                  background: `linear-gradient(to top, white, var(--accent), transparent)`,
                }}
                animate={{
                  height: [height * 0.6, height * 0.8, height * 0.5, height * 0.7, height * 0.6],
                  opacity: [1, 0.9, 1, 0.85, 1],
                }}
                transition={{
                  duration: 0.4 + Math.random() * 0.2,
                  repeat: Infinity,
                  delay: delay + 0.05,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          );
        })}
      </div>
      {/* Glow effect */}
      <motion.div
        className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)]"
        style={{
          width: size === 'small' ? 16 : 24,
          height: size === 'small' ? 16 : 24,
          filter: `blur(${size === 'small' ? 8 : 12}px)`,
        }}
        animate={{
          opacity: [0.4, 0.6, 0.3, 0.5, 0.4],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

interface QuestProgressProps {
  currentQuest: number;
  totalQuests: number;
}

export function QuestProgress({ currentQuest, totalQuests }: QuestProgressProps) {
  const questProgress = useQuestStore((state) => state.questProgress);

  return (
    <div className="w-full bg-gradient-to-b from-[var(--background-secondary)] to-[var(--background)] border-b border-[var(--border)]/50 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        {/* Desktop: Full quest journey */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-between">
            {/* Background track */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--background-tertiary)] rounded-full mx-6" />

            {/* Progress fill */}
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--success)] rounded-full mx-6"
              initial={{ width: 0 }}
              animate={{
                width: `calc(${(questProgress.filter((q) => q.status === 'completed').length / (totalQuests - 1)) * 100}% - 3rem)`
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />

            {/* Quest nodes */}
            {QUESTS.map((quest, index) => {
              const progress = questProgress.find((qp) => qp.questNumber === quest.number);
              const status = progress?.status ?? 'locked';
              const isActive = status === 'in_progress' || status === 'available';
              const isCompleted = status === 'completed';

              return (
                <div key={quest.number} className="relative z-10 flex flex-col items-center">
                  {/* Cyan flame for completed quests */}
                  {isCompleted && <CyanFlame size="normal" />}

                  {/* Glow effect for active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 -m-2 rounded-full bg-[var(--accent)] blur-xl opacity-30"
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}

                  {/* Node */}
                  <motion.div
                    className={cn(
                      'relative w-12 h-12 rounded-full flex items-center justify-center',
                      'font-display font-bold text-lg transition-all duration-300',
                      'shadow-lg',
                      status === 'locked' && [
                        'bg-[var(--background-tertiary)]',
                        'border-2 border-[var(--border)]',
                        'text-[var(--foreground-subtle)]',
                      ],
                      status === 'available' && [
                        'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]',
                        'border-2 border-[var(--primary)]',
                        'text-white',
                        'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
                      ],
                      status === 'in_progress' && [
                        'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)]',
                        'border-2 border-[var(--accent)]',
                        'text-[var(--background)]',
                        'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
                      ],
                      status === 'completed' && [
                        'bg-gradient-to-br from-[var(--success)] to-emerald-600',
                        'border-2 border-[var(--success)]',
                        'text-white',
                        'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
                      ]
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : status === 'locked' ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <>
                        {quest.number}
                        {isActive && (
                          <motion.div
                            className="absolute -top-1 -right-1"
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="w-4 h-4 text-[var(--achievement)]" />
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>

                  {/* Quest label - show on hover or for active */}
                  <motion.span
                    className={cn(
                      'absolute -bottom-6 text-xs font-medium whitespace-nowrap',
                      'transition-opacity duration-200',
                      isActive || isCompleted
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100',
                      isCompleted && 'text-[var(--success)]',
                      isActive && 'text-[var(--accent)]',
                      status === 'locked' && 'text-[var(--foreground-subtle)]'
                    )}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{
                      opacity: isActive || isCompleted ? 1 : 0,
                      y: 0
                    }}
                  >
                    {quest.title}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Elegant compact progress */}
        <div className="md:hidden">
          <div className="flex items-center gap-4">
            {/* Current quest indicator */}
            <div className="flex items-center gap-2">
              <motion.div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-lg"
                animate={{
                  boxShadow: [
                    '0 0 15px rgba(34,211,238,0.3)',
                    '0 0 25px rgba(34,211,238,0.5)',
                    '0 0 15px rgba(34,211,238,0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="font-display font-bold text-white">{currentQuest}</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xs text-[var(--foreground-muted)]">Quest</span>
                <span className="text-sm font-semibold">{currentQuest} of {totalQuests}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="relative h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--success)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(questProgress.filter((q) => q.status === 'completed').length / totalQuests) * 100}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </div>
              {/* Quest dots */}
              <div className="flex justify-between mt-1.5 px-0.5">
                {QUESTS.map((quest) => {
                  const progress = questProgress.find((qp) => qp.questNumber === quest.number);
                  const status = progress?.status ?? 'locked';
                  const isCompletedDot = status === 'completed';
                  return (
                    <div
                      key={quest.number}
                      className="relative"
                    >
                      {/* Cyan flame for completed dots */}
                      {isCompletedDot && <CyanFlame size="small" />}
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-all',
                          status === 'completed' && 'bg-[var(--success)]',
                          status === 'in_progress' && 'bg-[var(--accent)] animate-pulse',
                          status === 'available' && 'bg-[var(--primary)]',
                          status === 'locked' && 'bg-[var(--border)]'
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
