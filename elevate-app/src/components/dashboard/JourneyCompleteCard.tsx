'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  FolderPlus,
  MessageSquare,
  Compass,
  X,
  Award,
  Zap,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface JourneyCompleteCardProps {
  totalXP: number;
  level: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  className?: string;
}

const STORAGE_KEY = 'forgez-journey-complete-dismissed';

export function JourneyCompleteCard({
  totalXP,
  level,
  achievementsUnlocked,
  questsCompleted,
  className,
}: JourneyCompleteCardProps) {
  const t = useTranslations('quest');
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isLoaded, setIsLoaded] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === 'true');
    setIsLoaded(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  };

  // Don't render until we've checked localStorage
  if (!isLoaded || isDismissed) {
    return null;
  }

  const primaryActions = [
    {
      label: t('completion.actions.portfolio'),
      description: t('completion.actions.portfolioDesc'),
      href: '/portfolio',
      icon: FolderPlus,
    },
    {
      label: t('completion.actions.feedback'),
      description: t('completion.actions.feedbackDesc'),
      href: '/feedback/new',
      icon: MessageSquare,
    },
    {
      label: t('completion.actions.careers'),
      description: t('completion.actions.careersDesc'),
      href: '/compass',
      icon: Compass,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Card
          className={cn(
            'overflow-hidden border-2 border-[var(--achievement)]',
            'bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-tertiary)]',
            'shadow-[0_0_30px_var(--achievement-muted)]',
            className
          )}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--foreground-muted)]" />
            </button>

            {/* Trophy and Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--achievement)] to-[var(--secondary)] flex items-center justify-center glow-achievement">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold gradient-text-fire">
                  {t('completion.congratulations')}
                </h2>
                <p className="text-[var(--foreground-muted)]">
                  {t('completion.subtitle')}
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 py-4 border-y border-[var(--border)]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <p className="text-2xl font-display font-bold text-[var(--accent)]">
                  {totalXP.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {t('completion.stats.totalXP')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <p className="text-2xl font-display font-bold">
                  {level}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {t('completion.stats.level')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Award className="w-4 h-4 text-[var(--achievement)]" />
                </div>
                <p className="text-2xl font-display font-bold">
                  {achievementsUnlocked}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {t('completion.stats.achievements')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-[var(--success)]" />
                </div>
                <p className="text-2xl font-display font-bold text-[var(--success)]">
                  {questsCompleted}/8
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {t('completion.stats.quests')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 space-y-3">
            <p className="text-sm font-medium mb-3">
              {t('completion.whatsNext')}
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              {primaryActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full h-auto py-4 flex flex-col items-center gap-2',
                      'hover:bg-[var(--primary-muted)] hover:border-[var(--primary)]'
                    )}
                  >
                    <action.icon className="w-5 h-5 text-[var(--primary)]" />
                    <span className="font-medium">{action.label}</span>
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {action.description}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* View Journey Link */}
            <div className="flex justify-center pt-2">
              <Link href="/quest">
                <Button variant="ghost" size="sm">
                  {t('completion.viewJourney')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default JourneyCompleteCard;
