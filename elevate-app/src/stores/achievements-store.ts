import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AchievementDefinition,
  AchievementTrigger,
  AchievementWithStatus,
  PendingAchievementUnlock,
  UserAchievement,
  AchievementProgress,
} from '@/types/achievements';
import { ACHIEVEMENTS, getAchievementById, getAchievementsByTrigger } from '@/data/achievements';

// ============================================================================
// Types
// ============================================================================

interface AchievementState {
  // State
  unlockedAchievements: UserAchievement[];
  achievementProgress: Record<string, AchievementProgress>;
  pendingUnlock: PendingAchievementUnlock | null;
  unlockQueue: PendingAchievementUnlock[];
  isInitialized: boolean;

  // Actions
  initializeAchievements: () => void;
  checkAndUnlockAchievements: (
    trigger: AchievementTrigger,
    data?: Record<string, unknown>
  ) => PendingAchievementUnlock[];
  unlockAchievement: (achievementId: string) => PendingAchievementUnlock | null;
  updateProgress: (achievementId: string, currentValue: number) => void;
  acknowledgePendingUnlock: () => void;
  isAchievementUnlocked: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => AchievementProgress | undefined;
  getAchievementsWithStatus: () => AchievementWithStatus[];
  getUnlockedCount: () => number;
  reset: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

function checkAchievementCriteria(
  achievement: AchievementDefinition,
  trigger: AchievementTrigger,
  data: Record<string, unknown>,
  progress: AchievementProgress | undefined
): boolean {
  const { criteria } = achievement;

  // Check trigger matches
  if (criteria.trigger !== trigger) {
    return false;
  }

  // Check conditions if any
  if (criteria.conditions) {
    for (const [key, value] of Object.entries(criteria.conditions)) {
      // Special case for quest completion - check questNumber
      if (key === 'questNumber' && data.questNumber !== value) {
        return false;
      }
      // Special case for level up
      if (key === 'level' && (data.level as number) < (value as number)) {
        return false;
      }
      // Special case for XP threshold
      if (key === 'xpThreshold' && (data.totalXP as number) < (value as number)) {
        return false;
      }
      // Special case for archetype
      if (key === 'archetype' && data.archetype !== value) {
        return false;
      }
      // Special case for early adopter (always false unless specifically set)
      if (key === 'earlyAdopter' && !data.earlyAdopter) {
        return false;
      }
    }
  }

  // Check progress-based achievements
  if (criteria.targetValue !== undefined) {
    const currentValue = progress?.currentValue ?? 0;
    // For progress-based achievements, check if we've reached the target
    // The progress should be updated before this check
    if (trigger === 'quest_complete' && criteria.targetValue === 8) {
      // Special case: all quests completed
      const completedQuests = (data.completedQuests as number) ?? 0;
      return completedQuests >= criteria.targetValue;
    }
    return currentValue >= criteria.targetValue;
  }

  return true;
}

// ============================================================================
// Store
// ============================================================================

export const useAchievementsStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      // Initial state
      unlockedAchievements: [],
      achievementProgress: {},
      pendingUnlock: null,
      unlockQueue: [],
      isInitialized: false,

      // Initialize achievements
      initializeAchievements: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
          // Initialize progress for all progress-based achievements
          const initialProgress: Record<string, AchievementProgress> = {};
          ACHIEVEMENTS.forEach((achievement) => {
            if (achievement.hasProgress && achievement.criteria.targetValue) {
              initialProgress[achievement.id] = {
                id: crypto.randomUUID(),
                usedId: '', // Will be set when synced with backend
                achievementId: achievement.id,
                currentValue: 0,
                targetValue: achievement.criteria.targetValue,
                updatedAt: new Date().toISOString(),
              };
            }
          });

          set({
            achievementProgress: initialProgress,
            isInitialized: true,
          });
        }
      },

      // Check and unlock achievements based on trigger
      checkAndUnlockAchievements: (trigger, data = {}) => {
        const { unlockedAchievements, achievementProgress } = get();
        const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));
        const newUnlocks: PendingAchievementUnlock[] = [];

        // Get all achievements that match this trigger
        const relevantAchievements = getAchievementsByTrigger(trigger);

        for (const achievement of relevantAchievements) {
          // Skip if already unlocked
          if (unlockedIds.has(achievement.id)) {
            continue;
          }

          const progress = achievementProgress[achievement.id];

          // Check if criteria is met
          if (checkAchievementCriteria(achievement, trigger, data, progress)) {
            const unlock = get().unlockAchievement(achievement.id);
            if (unlock) {
              newUnlocks.push(unlock);
            }
          }
        }

        // If we have new unlocks, set the first one as pending
        if (newUnlocks.length > 0) {
          set({
            pendingUnlock: newUnlocks[0],
            unlockQueue: newUnlocks.slice(1),
          });
        }

        return newUnlocks;
      },

      // Unlock a specific achievement
      unlockAchievement: (achievementId) => {
        const { unlockedAchievements } = get();
        const achievement = getAchievementById(achievementId);

        if (!achievement) {
          console.warn(`Achievement not found: ${achievementId}`);
          return null;
        }

        // Check if already unlocked
        if (unlockedAchievements.some((ua) => ua.achievementId === achievementId)) {
          return null;
        }

        const now = new Date().toISOString();
        const userAchievement: UserAchievement = {
          id: crypto.randomUUID(),
          usedId: '', // Will be set when synced with backend
          achievementId,
          unlockedAt: now,
          notified: false,
        };

        const pendingUnlock: PendingAchievementUnlock = {
          achievement,
          xpAwarded: achievement.xpReward,
          unlockedAt: now,
        };

        set({
          unlockedAchievements: [...unlockedAchievements, userAchievement],
        });

        console.log(`Achievement unlocked: ${achievement.name} (+${achievement.xpReward} XP)`);

        return pendingUnlock;
      },

      // Update progress for a progress-based achievement
      updateProgress: (achievementId, currentValue) => {
        const { achievementProgress, unlockedAchievements } = get();
        const achievement = getAchievementById(achievementId);

        if (!achievement || !achievement.hasProgress) {
          return;
        }

        // Don't update if already unlocked
        if (unlockedAchievements.some((ua) => ua.achievementId === achievementId)) {
          return;
        }

        const existing = achievementProgress[achievementId];
        const targetValue = achievement.criteria.targetValue ?? 0;

        set({
          achievementProgress: {
            ...achievementProgress,
            [achievementId]: {
              id: existing?.id ?? crypto.randomUUID(),
              usedId: existing?.usedId ?? '',
              achievementId,
              currentValue: Math.min(currentValue, targetValue),
              targetValue,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      // Acknowledge pending unlock (show next in queue)
      acknowledgePendingUnlock: () => {
        const { unlockQueue } = get();

        if (unlockQueue.length > 0) {
          // Show next unlock
          set({
            pendingUnlock: unlockQueue[0],
            unlockQueue: unlockQueue.slice(1),
          });
        } else {
          // Clear pending
          set({ pendingUnlock: null });
        }
      },

      // Check if achievement is unlocked
      isAchievementUnlocked: (achievementId) => {
        return get().unlockedAchievements.some((ua) => ua.achievementId === achievementId);
      },

      // Get progress for an achievement
      getProgress: (achievementId) => {
        return get().achievementProgress[achievementId];
      },

      // Get all achievements with their unlock status
      getAchievementsWithStatus: () => {
        const { unlockedAchievements, achievementProgress } = get();
        const unlockedMap = new Map(
          unlockedAchievements.map((ua) => [ua.achievementId, ua])
        );

        return ACHIEVEMENTS.map((achievement): AchievementWithStatus => {
          const userAchievement = unlockedMap.get(achievement.id);
          const progress = achievementProgress[achievement.id];

          return {
            ...achievement,
            isUnlocked: !!userAchievement,
            unlockedAt: userAchievement?.unlockedAt,
            progress: progress
              ? {
                  current: progress.currentValue,
                  target: progress.targetValue,
                  percentage: (progress.currentValue / progress.targetValue) * 100,
                }
              : undefined,
          };
        });
      },

      // Get count of unlocked achievements
      getUnlockedCount: () => {
        return get().unlockedAchievements.length;
      },

      // Reset all achievement data
      reset: () => {
        set({
          unlockedAchievements: [],
          achievementProgress: {},
          pendingUnlock: null,
          unlockQueue: [],
          isInitialized: false,
        });
      },
    }),
    {
      name: 'forgez-achievements',
    }
  )
);

// ============================================================================
// Selector Hooks
// ============================================================================

export function useUnlockedAchievements(): UserAchievement[] {
  return useAchievementsStore((state) => state.unlockedAchievements);
}

export function usePendingAchievementUnlock(): PendingAchievementUnlock | null {
  return useAchievementsStore((state) => state.pendingUnlock);
}

export function useAchievementProgress(achievementId: string): AchievementProgress | undefined {
  return useAchievementsStore((state) => state.achievementProgress[achievementId]);
}

export function useAchievementsWithStatus(): AchievementWithStatus[] {
  const unlockedAchievements = useAchievementsStore((state) => state.unlockedAchievements);
  const achievementProgress = useAchievementsStore((state) => state.achievementProgress);

  return useMemo(() => {
    const unlockedMap = new Map(
      unlockedAchievements.map((ua) => [ua.achievementId, ua])
    );

    return ACHIEVEMENTS.map((achievement): AchievementWithStatus => {
      const userAchievement = unlockedMap.get(achievement.id);
      const progress = achievementProgress[achievement.id];

      return {
        ...achievement,
        isUnlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt,
        progress: progress
          ? {
              current: progress.currentValue,
              target: progress.targetValue,
              percentage: (progress.currentValue / progress.targetValue) * 100,
            }
          : undefined,
      };
    });
  }, [unlockedAchievements, achievementProgress]);
}

export function useUnlockedCount(): number {
  return useAchievementsStore((state) => state.unlockedAchievements.length);
}

// ============================================================================
// Action Helpers (for use outside of React components)
// ============================================================================

export function checkAchievements(
  trigger: AchievementTrigger,
  data?: Record<string, unknown>
): PendingAchievementUnlock[] {
  return useAchievementsStore.getState().checkAndUnlockAchievements(trigger, data);
}

export function incrementAchievementProgress(
  trigger: AchievementTrigger,
  incrementBy: number = 1
): void {
  const store = useAchievementsStore.getState();
  const relevantAchievements = getAchievementsByTrigger(trigger);

  for (const achievement of relevantAchievements) {
    if (achievement.hasProgress) {
      const currentProgress = store.achievementProgress[achievement.id];
      const newValue = (currentProgress?.currentValue ?? 0) + incrementBy;
      store.updateProgress(achievement.id, newValue);
    }
  }
}
