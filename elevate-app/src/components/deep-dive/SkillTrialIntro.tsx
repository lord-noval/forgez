'use client';

import { motion } from 'framer-motion';
import { Swords, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SkillTrialIntroProps {
  title?: string;
  description?: string;
  questionCount?: number;
  xpPerQuestion?: number;
  onBegin?: () => void;
  beginLabel?: string;
  animated?: boolean;
  className?: string;
}

export function SkillTrialIntro({
  title = 'Skill Trial',
  description = 'Test your understanding, apprentice. Answer wisely to earn XP.',
  questionCount = 3,
  xpPerQuestion = 50,
  onBegin,
  beginLabel = 'Begin Trial',
  animated = true,
  className,
}: SkillTrialIntroProps) {
  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.95 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative p-8 rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)]',
        'border-2 border-[var(--border)]',
        className
      )}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, var(--primary) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, var(--accent) 0%, transparent 50%)`,
        }}
      />

      {/* Decorative swords */}
      <motion.div
        initial={animated ? { opacity: 0, x: -20 } : undefined}
        animate={animated ? { opacity: 0.2, x: 0 } : undefined}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4"
      >
        <Swords className="w-12 h-12 text-[var(--primary)]" />
      </motion.div>

      <motion.div
        initial={animated ? { opacity: 0, x: 20 } : undefined}
        animate={animated ? { opacity: 0.2, x: 0 } : undefined}
        transition={{ delay: 0.2 }}
        className="absolute top-4 right-4"
      >
        <Swords className="w-12 h-12 text-[var(--primary)] transform scale-x-[-1]" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Icon */}
        <motion.div
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { scale: 1, rotate: 0 } : undefined}
          transition={{ delay: 0.1, type: 'spring', damping: 10 }}
          className={cn(
            'w-20 h-20 rounded-2xl flex items-center justify-center mb-6',
            'bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]',
            'shadow-[0_0_40px_var(--primary-muted)]'
          )}
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-display font-bold gradient-text-fire mb-3"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.3 }}
          className="text-[var(--foreground-muted)] max-w-md mb-6"
        >
          {description}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-6 mb-8"
        >
          {/* Question count */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display font-bold text-[var(--foreground)]">
              {questionCount}
            </span>
            <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
              Questions
            </span>
          </div>

          <div className="w-px h-10 bg-[var(--border)]" />

          {/* XP Reward */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-display font-bold text-[var(--accent)]">
              +{questionCount * xpPerQuestion}
            </span>
            <span className="text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
              Max XP
            </span>
          </div>
        </motion.div>

        {/* Begin Button */}
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onBegin}
            size="lg"
            className={cn(
              'px-8 py-6 text-lg font-display font-semibold',
              'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]',
              'hover:from-[var(--primary-hover)] hover:to-[var(--secondary-hover)]',
              'shadow-[0_0_30px_var(--primary-muted)]',
              'transition-all duration-300'
            )}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {beginLabel}
          </Button>
        </motion.div>
      </div>

      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 0 2px var(--border)',
            '0 0 20px 2px var(--primary-muted)',
            '0 0 0 2px var(--border)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

export default SkillTrialIntro;
