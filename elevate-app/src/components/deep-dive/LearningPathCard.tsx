'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Atom, Hammer, Users, Wrench, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type PathType = 'how_works' | 'how_build' | 'who_makes' | 'who_operates';

interface LearningPathCardProps {
  pathType: PathType;
  label: string;
  description: string;
  rpgTitle?: string;
  rpgDescription?: string;
  xpReward: number;
  isCompleted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  animated?: boolean;
  index?: number;
  className?: string;
}

interface PathConfig {
  icon: LucideIcon;
  accentColor: string;
  accentMuted: string;
  glowColor: string;
  gradient: string;
}

const pathConfig: Record<PathType, PathConfig> = {
  how_works: {
    icon: Atom,
    accentColor: 'var(--accent)',
    accentMuted: 'var(--accent-muted)',
    glowColor: 'rgba(34, 211, 238, 0.3)',
    gradient: 'from-[var(--accent)] to-[var(--accent-dark)]',
  },
  how_build: {
    icon: Hammer,
    accentColor: 'var(--primary)',
    accentMuted: 'var(--primary-muted)',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    gradient: 'from-[var(--primary)] to-[var(--secondary)]',
  },
  who_makes: {
    icon: Users,
    accentColor: 'var(--secondary)',
    accentMuted: 'var(--secondary-muted)',
    glowColor: 'rgba(234, 179, 8, 0.3)',
    gradient: 'from-[var(--secondary)] to-[var(--achievement)]',
  },
  who_operates: {
    icon: Wrench,
    accentColor: 'var(--success)',
    accentMuted: 'var(--success-muted)',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    gradient: 'from-[var(--success)] to-[var(--accent)]',
  },
};

export function LearningPathCard({
  pathType,
  label,
  description,
  rpgTitle,
  rpgDescription,
  xpReward,
  isCompleted = false,
  isSelected = false,
  onClick,
  animated = true,
  index = 0,
  className,
}: LearningPathCardProps) {
  const config = pathConfig[pathType];
  const Icon = config.icon;

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: index * 0.1 }}
      whileHover={!isCompleted ? { scale: 1.02 } : undefined}
      whileTap={!isCompleted ? { scale: 0.98 } : undefined}
    >
      <Card
        className={cn(
          'relative p-6 cursor-pointer transition-all duration-300 h-full overflow-hidden',
          'border-2 bg-[var(--background-secondary)]',
          isCompleted && 'border-[var(--success)] bg-[var(--success-muted)] cursor-default',
          isSelected && !isCompleted && 'border-[var(--primary)]',
          !isCompleted && !isSelected && 'border-[var(--border)] hover:border-[var(--primary)]',
          className
        )}
        style={{
          boxShadow: isSelected && !isCompleted
            ? `0 0 30px ${config.glowColor}`
            : undefined,
        }}
        onClick={() => !isCompleted && onClick?.()}
      >
        {/* Pulse ring on hover for non-completed */}
        {!isCompleted && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-xl opacity-0',
              'transition-opacity duration-300'
            )}
            style={{
              background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`,
            }}
            whileHover={{ opacity: 1 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center h-full">
          {/* Icon container with animated ring */}
          <div className="relative mb-4">
            <motion.div
              className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center',
                'transition-all duration-300'
              )}
              style={{
                backgroundColor: isCompleted ? 'var(--success)' : config.accentMuted,
              }}
              whileHover={!isCompleted ? { rotate: [0, -5, 5, 0] } : undefined}
              transition={{ duration: 0.5 }}
            >
              {isCompleted ? (
                <Check className="w-8 h-8 text-white" />
              ) : (
                <Icon
                  className="w-8 h-8"
                  style={{ color: config.accentColor }}
                />
              )}
            </motion.div>

            {/* Animated ring for non-completed */}
            {!isCompleted && isSelected && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ border: `2px solid ${config.accentColor}` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>

          {/* RPG Title */}
          {rpgTitle && !isCompleted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: config.accentColor }}
            >
              {rpgTitle}
            </motion.p>
          )}

          {/* Main label */}
          <h3 className="font-display font-semibold text-lg mb-2 text-[var(--foreground)]">
            {label}
          </h3>

          {/* Description */}
          <p className="text-sm text-[var(--foreground-muted)] flex-1">
            {rpgDescription || description}
          </p>

          {/* XP Badge */}
          <motion.div
            className={cn(
              'mt-4 px-4 py-1.5 rounded-full text-sm font-semibold',
              'flex items-center gap-1.5',
              isCompleted
                ? 'bg-[var(--success-muted)] text-[var(--success)]'
                : 'bg-[var(--accent-muted)] text-[var(--accent)]'
            )}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed' : `+${xpReward} XP`}</span>
          </motion.div>
        </div>

        {/* Gradient shine effect for non-completed cards */}
        {!isCompleted && (
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0"
            style={{
              background: `linear-gradient(135deg, transparent 40%, ${config.glowColor} 50%, transparent 60%)`,
            }}
            whileHover={{
              opacity: 1,
              transition: { duration: 0.3 },
            }}
          />
        )}
      </Card>
    </motion.div>
  );
}

export default LearningPathCard;
