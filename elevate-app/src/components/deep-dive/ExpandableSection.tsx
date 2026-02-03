'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  animated?: boolean;
  className?: string;
}

export function ExpandableSection({
  title,
  children,
  defaultOpen = false,
  animated = true,
  className,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 10 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      className={cn(
        'rounded-xl border border-[var(--border)] overflow-hidden',
        'bg-[var(--background-secondary)]',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'transition-colors duration-200',
          'hover:bg-[var(--background-tertiary)]',
          isOpen && 'bg-[var(--background-tertiary)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-[var(--primary-muted)] border border-[var(--border)]'
            )}
          >
            <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <span className="font-display font-semibold text-[var(--foreground)]">
            {title}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'bg-[var(--background-tertiary)]',
            isOpen && 'bg-[var(--primary-muted)]'
          )}
        >
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-colors',
              isOpen ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]'
            )}
          />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 pb-4 pt-2">
              <div className="pl-11 text-sm text-[var(--foreground)] leading-relaxed">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ExpandableSection;
