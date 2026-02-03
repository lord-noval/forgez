'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
import { useCompletedQuestsCount } from '@/stores/quest-store';
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

export function MobileHeader() {
  const totalXP = useTotalXP();
  const level = useLevel();
  const levelProgress = useLevelProgress();
  const recentXP = useRecentXP();
  const archetype = useArchetype();
  const completedQuests = useCompletedQuestsCount();
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

  return (
    <header className="sticky top-0 z-40 bg-[var(--background-secondary)]/95 backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo + Archetype */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
            {archetype && ArchetypeIcon ? (
              <ArchetypeIcon
                className="w-4 h-4"
                style={{ color: archetype.color }}
              />
            ) : (
              <Hammer className="w-4 h-4 text-[var(--primary)]" />
            )}
          </div>
          <span className="text-lg font-bold font-display gradient-text">
            FORGE-Z
          </span>
        </Link>

        {/* Stats Row */}
        <div className="flex items-center gap-3">
          {/* Level Circle */}
          <Link href="/quest" className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-[var(--background)] flex items-center justify-center">
                <span className="text-sm font-bold text-[var(--primary)]">{level}</span>
              </div>
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-9 h-9 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="transparent"
                strokeWidth="2"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={100.53}
                initial={{ strokeDashoffset: 100.53 }}
                animate={{ strokeDashoffset: 100.53 - (100.53 * levelProgress.progress) / 100 }}
                transition={{ duration: 0.5 }}
              />
            </svg>
          </Link>

          {/* XP Counter */}
          <div className="relative flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--background-tertiary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-mono font-bold text-[var(--foreground)]">
              {totalXP >= 1000 ? `${(totalXP / 1000).toFixed(1)}k` : totalXP}
            </span>
            {/* XP Gain popup */}
            <AnimatePresence>
              {showXPGain && recentXP && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -8, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.8 }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--background)] text-xs font-bold whitespace-nowrap"
                >
                  +{recentXP}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quest Progress */}
          <Link
            href="/quest"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--background-tertiary)]"
          >
            <Scroll className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-bold text-[var(--primary)]">{completedQuests}</span>
            <span className="text-xs text-[var(--foreground-muted)]">/8</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
