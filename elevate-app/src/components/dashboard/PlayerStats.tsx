'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Sparkles,
  Scroll,
  Hammer,
  Lightbulb,
  Compass,
  Trophy,
} from 'lucide-react';
import { useTotalXP, useLevel, useLevelProgress, useRecentXP, useXPStore } from '@/stores/xp-store';
import { useArchetype } from '@/stores/archetype-store';
import { useCompletedQuestsCount, useQuestStore } from '@/stores/quest-store';
import { useEffect, useState } from 'react';
import type { ArchetypeId } from '@/themes/types';
import type { LucideIcon } from 'lucide-react';

// Archetype icons mapping
const archetypeIcons: Record<ArchetypeId, LucideIcon> = {
  BUILDER: Hammer,
  STRATEGIST: Lightbulb,
  EXPLORER: Compass,
  COMPETITOR: Trophy,
};

interface PlayerStatsProps {
  compact?: boolean;
}

export function PlayerStats({ compact = false }: PlayerStatsProps) {
  const t = useTranslations('common');
  const totalXP = useTotalXP();
  const level = useLevel();
  const levelProgress = useLevelProgress();
  const recentXP = useRecentXP();
  const archetype = useArchetype();
  const completedQuests = useCompletedQuestsCount();
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);
  const { clearRecentXP } = useXPStore();

  const [showXPGain, setShowXPGain] = useState(false);

  // Handle XP gain animation
  useEffect(() => {
    if (recentXP && recentXP > 0) {
      setShowXPGain(true);
      const timer = setTimeout(() => {
        setShowXPGain(false);
        clearRecentXP();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [recentXP, clearRecentXP]);

  const ArchetypeIcon = archetype ? archetypeIcons[archetype.id] : null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Level Badge */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-muted)] flex items-center justify-center border-2 border-[var(--primary)]">
            <span className="text-sm font-bold text-[var(--primary)]">{level}</span>
          </div>
          {/* Circular progress */}
          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="var(--background-tertiary)"
              strokeWidth="2"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={113.1}
              initial={{ strokeDashoffset: 113.1 }}
              animate={{ strokeDashoffset: 113.1 - (113.1 * levelProgress.progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>

        {/* XP Counter */}
        <div className="relative">
          <div className="flex items-center gap-1 text-sm">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-mono font-medium text-[var(--foreground)]">
              {totalXP.toLocaleString()}
            </span>
          </div>
          {/* XP Gain popup */}
          <AnimatePresence>
            {showXPGain && recentXP && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-5 left-0 right-0 text-center text-xs font-bold text-[var(--accent)]"
              >
                +{recentXP}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Level & XP Row */}
      <div className="flex items-center justify-between">
        {/* Level Circle */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
            <div className="w-12 h-12 rounded-full bg-[var(--background)] flex flex-col items-center justify-center">
              <span className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wider">
                {t('playerStats.level')}
              </span>
              <span className="text-lg font-bold font-display text-[var(--primary)]">{level}</span>
            </div>
          </div>
          {/* Circular progress ring */}
          <svg className="absolute inset-0 w-14 h-14 -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="transparent"
              strokeWidth="3"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={163.36}
              initial={{ strokeDashoffset: 163.36 }}
              animate={{ strokeDashoffset: 163.36 - (163.36 * levelProgress.progress) / 100 }}
              transition={{ duration: 0.5 }}
              className="drop-shadow-[0_0_4px_var(--accent)]"
            />
          </svg>
        </div>

        {/* XP Display */}
        <div className="flex-1 ml-3 relative">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold font-mono text-[var(--foreground)]">
                  {totalXP.toLocaleString()}
                </span>
                <span className="text-xs text-[var(--foreground-muted)]">XP</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[var(--foreground-muted)]">
                <span>{levelProgress.current.toLocaleString()}</span>
                <span>/</span>
                <span>{levelProgress.required.toLocaleString()}</span>
                <span>{t('playerStats.toNextLevel')}</span>
              </div>
            </div>
          </div>
          {/* XP Gain popup */}
          <AnimatePresence>
            {showXPGain && recentXP && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -5, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                className="absolute -top-2 right-0 px-2 py-1 rounded-full bg-[var(--accent)] text-[var(--background)] text-sm font-bold shadow-lg"
              >
                +{recentXP} XP
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${levelProgress.progress}%` }}
          transition={{ duration: 0.5 }}
        />
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Archetype & Quest Progress Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Archetype Badge */}
        {archetype ? (
          <Link href="/quest/1" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${archetype.color}20` }}
            >
              {ArchetypeIcon && (
                <ArchetypeIcon
                  className="w-4 h-4"
                  style={{ color: archetype.color }}
                />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[var(--foreground)]" style={{ color: archetype.color }}>
                {archetype.name}
              </span>
              <span className="text-[10px] text-[var(--foreground-muted)]">
                {archetype.tagline}
              </span>
            </div>
          </Link>
        ) : (
          <Link href="/quest/1" className="group flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
              <span className="text-xs">?</span>
            </div>
            <span className="text-xs">{t('playerStats.discoverArchetype')}</span>
          </Link>
        )}

        {/* Quest Progress */}
        <Link href="/quest" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--background-tertiary)] group-hover:bg-[var(--primary-muted)] transition-colors">
            <Scroll className="w-4 h-4 text-[var(--primary)]" />
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-[var(--primary)]">{completedQuests}</span>
              <span className="text-xs text-[var(--foreground-muted)]">/</span>
              <span className="text-xs text-[var(--foreground-muted)]">8</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quest Dots */}
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((questNum) => {
          const isCompleted = completedQuests >= questNum;
          const isCurrent = questNum === currentQuestNumber;
          return (
            <motion.div
              key={questNum}
              className={`w-2 h-2 rounded-full transition-colors ${
                isCompleted
                  ? 'bg-[var(--success)]'
                  : isCurrent
                  ? 'bg-[var(--primary)]'
                  : 'bg-[var(--background-tertiary)]'
              }`}
              animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          );
        })}
      </div>
    </div>
  );
}
