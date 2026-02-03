'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useAchievementsStore,
  checkAchievements,
  incrementAchievementProgress,
} from '@/stores/achievements-store';
import { useXPStore } from '@/stores/xp-store';
import type { AchievementTrigger, PendingAchievementUnlock } from '@/types/achievements';

/**
 * Hook to simplify achievement triggering from quest pages
 * Provides methods to check achievements and handle XP awards
 */
export function useAchievementTrigger() {
  const router = useRouter();
  const { awardXP } = useXPStore();
  const { pendingUnlock, acknowledgePendingUnlock, initializeAchievements } = useAchievementsStore();

  /**
   * Trigger achievement check and award XP for unlocks
   */
  const triggerAchievement = useCallback(
    (trigger: AchievementTrigger, data?: Record<string, unknown>): PendingAchievementUnlock[] => {
      // Initialize if needed
      initializeAchievements();

      // Check for achievements
      const unlocks = checkAchievements(trigger, data);

      // Award XP for each unlock
      unlocks.forEach((unlock) => {
        awardXP(
          unlock.xpAwarded,
          'quest_completion', // Use quest_completion as source for achievement XP
          unlock.achievement.id,
          `Achievement: ${unlock.achievement.name}`
        );
      });

      return unlocks;
    },
    [awardXP, initializeAchievements]
  );

  /**
   * Increment progress for progress-based achievements
   */
  const incrementProgress = useCallback(
    (trigger: AchievementTrigger, incrementBy: number = 1): void => {
      initializeAchievements();
      incrementAchievementProgress(trigger, incrementBy);
    },
    [initializeAchievements]
  );

  /**
   * Navigate to achievements page
   */
  const viewAllAchievements = useCallback(() => {
    acknowledgePendingUnlock();
    router.push('/achievements');
  }, [acknowledgePendingUnlock, router]);

  return {
    triggerAchievement,
    incrementProgress,
    pendingUnlock,
    acknowledgePendingUnlock,
    viewAllAchievements,
  };
}

/**
 * Get the count of completed quests from quest store
 */
export function getCompletedQuestsCount(): number {
  // This is a helper to be used outside React components
  // Import quest store directly when needed
  return 0; // Will be calculated from quest store
}
