'use client';

import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Sparkles, Crown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalloutVariant = 'knowledge' | 'warning' | 'tip' | 'legendary';

interface CalloutBoxProps {
  variant: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}

interface VariantConfig {
  icon: LucideIcon;
  borderClass: string;
  bgClass: string;
  iconColorClass: string;
  titleColorClass: string;
  glowClass: string;
  pattern: boolean;
}

const variantConfig: Record<CalloutVariant, VariantConfig> = {
  knowledge: {
    icon: Lightbulb,
    borderClass: 'border-[var(--accent)]',
    bgClass: 'bg-[var(--accent-muted)]',
    iconColorClass: 'text-[var(--accent)]',
    titleColorClass: 'text-[var(--accent)]',
    glowClass: 'shadow-[0_0_15px_var(--accent-muted)]',
    pattern: true,
  },
  warning: {
    icon: AlertTriangle,
    borderClass: 'border-[var(--warning)]',
    bgClass: 'bg-[var(--warning-muted)]',
    iconColorClass: 'text-[var(--warning)]',
    titleColorClass: 'text-[var(--warning)]',
    glowClass: 'shadow-[0_0_15px_var(--warning-muted)]',
    pattern: true,
  },
  tip: {
    icon: Sparkles,
    borderClass: 'border-[var(--success)]',
    bgClass: 'bg-[var(--success-muted)]',
    iconColorClass: 'text-[var(--success)]',
    titleColorClass: 'text-[var(--success)]',
    glowClass: 'shadow-[0_0_15px_var(--success-muted)]',
    pattern: true,
  },
  legendary: {
    icon: Crown,
    borderClass: 'border-[var(--achievement)]',
    bgClass: 'bg-gradient-to-br from-[var(--achievement-muted)] to-[var(--secondary-muted)]',
    iconColorClass: 'text-[var(--achievement)]',
    titleColorClass: 'text-[var(--achievement)]',
    glowClass: 'shadow-[0_0_20px_var(--achievement-muted),0_0_40px_var(--secondary-muted)]',
    pattern: true,
  },
};

const defaultTitles: Record<CalloutVariant, string> = {
  knowledge: 'Key Insight',
  warning: 'Important Note',
  tip: 'Pro Tip',
  legendary: 'Master Knowledge',
};

export function CalloutBox({
  variant,
  title,
  children,
  animated = true,
  className,
}: CalloutBoxProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayTitle = title || defaultTitles[variant];

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 10, scale: 0.98 } : undefined}
      animate={animated ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative rounded-xl border-2 p-4 overflow-hidden',
        config.borderClass,
        config.bgClass,
        config.glowClass,
        className
      )}
    >
      {/* Pattern overlay */}
      {config.pattern && (
        <div className="absolute inset-0 callout-pattern pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            initial={animated ? { scale: 0 } : undefined}
            animate={animated ? { scale: 1 } : undefined}
            transition={{ duration: 0.3, delay: 0.1, type: 'spring' }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-[var(--background-secondary)] border border-[var(--border)]'
            )}
          >
            <Icon className={cn('w-4 h-4', config.iconColorClass)} />
          </motion.div>
          <span className={cn('font-display font-semibold text-sm', config.titleColorClass)}>
            {displayTitle}
          </span>
          {variant === 'legendary' && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-[var(--secondary)]" />
            </motion.div>
          )}
        </div>

        {/* Body */}
        <div className="text-sm text-[var(--foreground)] leading-relaxed">
          {children}
        </div>
      </div>

      {/* Legendary shimmer effect */}
      {variant === 'legendary' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(245, 158, 11, 0.1) 50%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  );
}

export default CalloutBox;
