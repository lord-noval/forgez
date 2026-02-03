import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// XP thresholds for levels (level = sqrt(totalXP / 100))
export function calculateLevel(totalXP: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalXP / 100)));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function xpToNextLevel(totalXP: number): { current: number; required: number; progress: number } {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpRequiredForNext = nextLevelXP - currentLevelXP;

  return {
    current: xpInCurrentLevel,
    required: xpRequiredForNext,
    progress: (xpInCurrentLevel / xpRequiredForNext) * 100,
  };
}

export type XPSource =
  | 'quest_completion'
  | 'quiz_correct'
  | 'project_upload'
  | 'peer_review'
  | 'hackathon_join'
  | 'hackathon_submit'
  | 'guild_join'
  | 'company_view'
  | 'role_explore'
  | 'course_start'
  | 'deep_dive_complete'
  | 'archetype_complete'
  | 'achievement_unlock';

export interface XPTransaction {
  id: string;
  amount: number;
  source: XPSource;
  sourceId?: string;
  description?: string;
  createdAt: string;
}

interface PendingLevelUp {
  from: number;
  to: number;
}

interface XPState {
  // State
  totalXP: number;
  level: number;
  transactions: XPTransaction[];
  recentXPGain: number | null; // For animation display
  pendingLevelUp: PendingLevelUp | null; // For level up celebration

  // Actions
  awardXP: (amount: number, source: XPSource, sourceId?: string, description?: string) => void;
  clearRecentXP: () => void;
  acknowledgeLevelUp: () => void;
  getXPBySource: (source: XPSource) => number;
  reset: () => void;
}

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalXP: 0,
      level: 1,
      transactions: [],
      recentXPGain: null,
      pendingLevelUp: null,

      // Award XP
      awardXP: (amount: number, source: XPSource, sourceId?: string, description?: string) => {
        const transaction: XPTransaction = {
          id: crypto.randomUUID(),
          amount,
          source,
          sourceId,
          description,
          createdAt: new Date().toISOString(),
        };

        const newTotal = get().totalXP + amount;
        const newLevel = calculateLevel(newTotal);
        const oldLevel = get().level;

        // Check for level up
        const levelUpData = newLevel > oldLevel ? { from: oldLevel, to: newLevel } : null;

        set({
          totalXP: newTotal,
          level: newLevel,
          transactions: [...get().transactions, transaction],
          recentXPGain: amount,
          pendingLevelUp: levelUpData,
        });

        if (levelUpData) {
          console.log(`Level up! ${oldLevel} -> ${newLevel}`);
        }
      },

      // Clear recent XP (after animation)
      clearRecentXP: () => {
        set({ recentXPGain: null });
      },

      // Acknowledge level up (after celebration)
      acknowledgeLevelUp: () => {
        set({ pendingLevelUp: null });
      },

      // Get total XP from a specific source
      getXPBySource: (source: XPSource) => {
        return get().transactions
          .filter((t) => t.source === source)
          .reduce((sum, t) => sum + t.amount, 0);
      },

      // Reset
      reset: () => {
        set({
          totalXP: 0,
          level: 1,
          transactions: [],
          recentXPGain: null,
          pendingLevelUp: null,
        });
      },
    }),
    {
      name: 'forgez-xp',
    }
  )
);

// Selector hooks
export function useTotalXP(): number {
  return useXPStore((state) => state.totalXP);
}

export function useLevel(): number {
  return useXPStore((state) => state.level);
}

export function useLevelProgress(): { current: number; required: number; progress: number } {
  const totalXP = useXPStore((state) => state.totalXP);
  return xpToNextLevel(totalXP);
}

export function useRecentXP(): number | null {
  return useXPStore((state) => state.recentXPGain);
}
