'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Atom, Hammer, Users, Wrench, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PathType = 'how_works' | 'how_build' | 'who_makes' | 'who_operates';

interface SectionHeaderProps {
  title: string;
  pathType?: PathType;
  level?: 'h2' | 'h3';
  animated?: boolean;
  className?: string;
}

const pathConfig: Record<PathType, { icon: LucideIcon; accentClass: string; gradientClass: string }> = {
  how_works: {
    icon: Atom,
    accentClass: 'text-[var(--accent)]',
    gradientClass: 'from-[var(--accent)] to-[var(--accent-dark)]',
  },
  how_build: {
    icon: Hammer,
    accentClass: 'text-[var(--primary)]',
    gradientClass: 'from-[var(--primary)] to-[var(--secondary)]',
  },
  who_makes: {
    icon: Users,
    accentClass: 'text-[var(--secondary)]',
    gradientClass: 'from-[var(--secondary)] to-[var(--achievement)]',
  },
  who_operates: {
    icon: Wrench,
    accentClass: 'text-[var(--success)]',
    gradientClass: 'from-[var(--success)] to-[var(--accent)]',
  },
};

export function SectionHeader({
  title,
  pathType,
  level = 'h2',
  animated = true,
  className,
}: SectionHeaderProps) {
  const config = pathType ? pathConfig[pathType] : null;
  const Icon = config?.icon || Sparkles;
  const accentClass = config?.accentClass || 'text-[var(--primary)]';
  const gradientClass = config?.gradientClass || 'from-[var(--primary)] to-[var(--secondary)]';

  const HeadingTag = level;
  const isH2 = level === 'h2';

  return (
    <motion.div
      initial={animated ? { opacity: 0, x: -20 } : undefined}
      animate={animated ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('relative mb-6', className)}
    >
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          className={cn(
            'flex items-center justify-center rounded-lg',
            isH2 ? 'w-10 h-10' : 'w-8 h-8',
            'bg-[var(--background-tertiary)] border border-[var(--border)]'
          )}
        >
          <Icon className={cn(isH2 ? 'w-5 h-5' : 'w-4 h-4', accentClass)} />
        </motion.div>

        <HeadingTag
          className={cn(
            'font-display font-bold',
            isH2 ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
            'text-[var(--foreground)]'
          )}
        >
          {title}
        </HeadingTag>
      </div>

      {/* Animated gradient underline */}
      <motion.div
        initial={animated ? { scaleX: 0 } : undefined}
        animate={animated ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="origin-left"
      >
        <div
          className={cn(
            'h-1 rounded-full bg-gradient-to-r',
            gradientClass,
            isH2 ? 'w-24' : 'w-16'
          )}
        />
      </motion.div>
    </motion.div>
  );
}

export default SectionHeader;
