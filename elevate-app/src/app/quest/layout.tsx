'use client';

import { useCallback, useState, useEffect } from 'react';
import { Swords } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuestStore, QUESTS, useCompletedQuestsCount } from '@/stores/quest-store';
import { useXPStore } from '@/stores/xp-store';
import {
  useAchievementsStore,
  checkAchievements,
} from '@/stores/achievements-store';
import { XPBadge } from '@/components/quest/XPBadge';
import { QuestProgress } from '@/components/quest/QuestProgress';
import { EnhancedQuestCompleteModal } from '@/components/celebrations/EnhancedQuestCompleteModal';
import { LevelUpCelebration } from '@/components/celebrations/LevelUpCelebration';
import { AchievementUnlockModal } from '@/components/achievements/AchievementUnlockModal';
import { useTranslations } from 'next-intl';
import type { PendingAchievementUnlock } from '@/types/achievements';

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('quest');
  const router = useRouter();

  // Quest store
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);
  const pendingQuestComplete = useQuestStore((state) => state.pendingQuestComplete);
  const acknowledgeQuestComplete = useQuestStore((state) => state.acknowledgeQuestComplete);
  const completedQuestsCount = useCompletedQuestsCount();

  // XP store
  const totalXP = useXPStore((state) => state.totalXP);
  const level = useXPStore((state) => state.level);
  const pendingLevelUp = useXPStore((state) => state.pendingLevelUp);
  const acknowledgeLevelUp = useXPStore((state) => state.acknowledgeLevelUp);
  const awardXP = useXPStore((state) => state.awardXP);

  // Achievement store
  const { pendingUnlock, acknowledgePendingUnlock, initializeAchievements } = useAchievementsStore();

  // Track recently unlocked achievements for display in modal
  const [recentAchievements, setRecentAchievements] = useState<PendingAchievementUnlock[]>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Initialize achievements on mount
  useEffect(() => {
    initializeAchievements();
  }, [initializeAchievements]);

  // Handle quest completion acknowledgment
  const handleQuestContinue = useCallback(() => {
    const questNumber = pendingQuestComplete?.questNumber;
    const nextQuest = questNumber
      ? Math.min(questNumber + 1, 8)
      : currentQuestNumber;

    // Check for quest-related achievements
    if (questNumber) {
      const unlocks = checkAchievements('quest_complete', {
        questNumber,
        completedQuests: completedQuestsCount,
      });

      // Award XP for achievements
      unlocks.forEach((unlock) => {
        awardXP(
          unlock.xpAwarded,
          'quest_completion',
          unlock.achievement.id,
          `Achievement: ${unlock.achievement.name}`
        );
      });

      // Store recent achievements for display
      if (unlocks.length > 0) {
        setRecentAchievements(unlocks);
      }
    }

    acknowledgeQuestComplete();

    // Navigate to next quest or dashboard if complete
    if (questNumber === 8) {
      router.push('/dashboard');
    } else {
      router.push(`/quest/${nextQuest}`);
    }
  }, [pendingQuestComplete, currentQuestNumber, acknowledgeQuestComplete, router, completedQuestsCount, awardXP]);

  // Handle level up acknowledgment
  const handleLevelUpComplete = useCallback(() => {
    acknowledgeLevelUp();
  }, [acknowledgeLevelUp]);

  // Handle achievement acknowledgment
  const handleAchievementClose = useCallback(() => {
    acknowledgePendingUnlock();
  }, [acknowledgePendingUnlock]);

  // Handle view all achievements
  const handleViewAllAchievements = useCallback(() => {
    acknowledgePendingUnlock();
    router.push('/achievements');
  }, [acknowledgePendingUnlock, router]);

  // Get flavor text for completed quest
  const getFlavorText = (questNumber: number): string => {
    const key = `flavor.questComplete.${questNumber}` as const;
    try {
      return t(key);
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
              <Swords className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <span className="font-display font-bold text-lg gradient-text-fire">FORGE-Z</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
              <span>Quest {currentQuestNumber}/8</span>
            </div>
            <XPBadge xp={totalXP} level={level} />
          </div>
        </div>
      </header>

      {/* Quest Progress Bar */}
      <div className="fixed top-[52px] left-0 right-0 z-40">
        <QuestProgress currentQuest={currentQuestNumber} totalQuests={QUESTS.length} />
      </div>

      {/* Main Content */}
      <main className="pt-32 min-h-screen">
        {children}
      </main>

      {/* Enhanced Quest Complete Modal */}
      <EnhancedQuestCompleteModal
        show={pendingQuestComplete !== null}
        questNumber={pendingQuestComplete?.questNumber || 1}
        questTitle={pendingQuestComplete?.questTitle || ''}
        xpEarned={pendingQuestComplete?.xpEarned || 0}
        flavorText={pendingQuestComplete ? getFlavorText(pendingQuestComplete.questNumber) : undefined}
        recentAchievements={recentAchievements}
        onContinue={handleQuestContinue}
        onViewAchievements={handleViewAllAchievements}
      />

      {/* Achievement Unlock Modal (shown after quest modal closes) */}
      <AchievementUnlockModal
        pendingUnlock={pendingUnlock}
        onClose={handleAchievementClose}
        onViewAll={handleViewAllAchievements}
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration
        show={pendingLevelUp !== null}
        fromLevel={pendingLevelUp?.from || 1}
        toLevel={pendingLevelUp?.to || 1}
        onComplete={handleLevelUpComplete}
      />
    </div>
  );
}
