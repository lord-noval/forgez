import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestStatus, Quest } from '@/themes/types';

// Quest definitions with XP rewards
export const QUESTS: Quest[] = [
  {
    number: 1,
    title: 'Character Creation',
    subtitle: 'Discover Your Archetype',
    description: 'Define your playstyle and discover which career archetype matches your personality.',
    xpReward: 100,
    icon: 'UserCircle',
  },
  {
    number: 2,
    title: 'The Epic Artifact',
    subtitle: 'Behold Amazing Technology',
    description: 'Explore the technology that defines your chosen industry. See the specs, watch the videos.',
    xpReward: 25,
    icon: 'Sparkles',
  },
  {
    number: 3,
    title: 'Deep Dive',
    subtitle: 'Unlock Knowledge',
    description: 'Dive deep into how things work, how they are built, and who makes them happen.',
    xpReward: 75,
    icon: 'BookOpen',
  },
  {
    number: 4,
    title: 'The Guilds',
    subtitle: 'Discover Companies',
    description: 'Explore real companies across regions. Find your future workplace.',
    xpReward: 10,
    icon: 'Building2',
  },
  {
    number: 5,
    title: 'Talent Hunt',
    subtitle: 'Explore Career Roles',
    description: 'Discover roles, salaries, and skill requirements for your chosen field.',
    xpReward: 25,
    icon: 'Target',
  },
  {
    number: 6,
    title: "Leader's Wisdom",
    subtitle: 'Learn Soft Skills',
    description: 'Gain insights from industry leaders and assess your soft skills.',
    xpReward: 100,
    icon: 'Award',
  },
  {
    number: 7,
    title: 'Skill Forge',
    subtitle: 'Level Up Your Skills',
    description: 'Find courses and resources to build the skills you need.',
    xpReward: 25,
    icon: 'Flame',
  },
  {
    number: 8,
    title: 'Guild Hall',
    subtitle: 'Join the Community',
    description: 'Connect with peers, join hackathons, and build your portfolio.',
    xpReward: 100,
    icon: 'Users',
  },
];

export interface QuestProgress {
  questNumber: number;
  status: QuestStatus;
  xpEarned: number;
  progressData?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}

interface PendingQuestComplete {
  questNumber: number;
  questTitle: string;
  xpEarned: number;
}

interface QuestState {
  // State
  questProgress: QuestProgress[];
  currentQuestNumber: number;
  isInitialized: boolean;
  pendingQuestComplete: PendingQuestComplete | null; // For quest completion celebration

  // Actions
  initializeQuests: () => void;
  startQuest: (questNumber: number) => void;
  updateQuestProgress: (questNumber: number, data: Partial<QuestProgress>) => void;
  completeQuest: (questNumber: number, xpEarned?: number) => void;
  acknowledgeQuestComplete: () => void;
  getQuestStatus: (questNumber: number) => QuestStatus;
  getQuestProgress: (questNumber: number) => QuestProgress | undefined;
  reset: () => void;
}

const initialQuestProgress: QuestProgress[] = QUESTS.map((quest, index) => ({
  questNumber: quest.number,
  status: index === 0 ? 'available' : 'locked',
  xpEarned: 0,
}));

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      // Initial state
      questProgress: initialQuestProgress,
      currentQuestNumber: 1,
      isInitialized: false,
      pendingQuestComplete: null,

      // Initialize quests (call after user auth)
      initializeQuests: () => {
        const { isInitialized } = get();
        if (!isInitialized) {
          set({
            questProgress: initialQuestProgress,
            currentQuestNumber: 1,
            isInitialized: true,
          });
        }
      },

      // Start a quest
      startQuest: (questNumber: number) => {
        set((state) => ({
          questProgress: state.questProgress.map((qp) =>
            qp.questNumber === questNumber
              ? {
                  ...qp,
                  status: 'in_progress' as QuestStatus,
                  startedAt: new Date().toISOString(),
                }
              : qp
          ),
          currentQuestNumber: questNumber,
        }));
      },

      // Update quest progress data
      updateQuestProgress: (questNumber: number, data: Partial<QuestProgress>) => {
        set((state) => ({
          questProgress: state.questProgress.map((qp) =>
            qp.questNumber === questNumber
              ? { ...qp, ...data }
              : qp
          ),
        }));
      },

      // Complete a quest and unlock next
      completeQuest: (questNumber: number, xpEarned?: number) => {
        const quest = QUESTS.find((q) => q.number === questNumber);
        const actualXp = xpEarned ?? quest?.xpReward ?? 0;

        set((state) => ({
          questProgress: state.questProgress.map((qp) => {
            // Mark current quest as completed
            if (qp.questNumber === questNumber) {
              return {
                ...qp,
                status: 'completed' as QuestStatus,
                xpEarned: actualXp,
                completedAt: new Date().toISOString(),
              };
            }
            // Unlock next quest
            if (qp.questNumber === questNumber + 1 && qp.status === 'locked') {
              return {
                ...qp,
                status: 'available' as QuestStatus,
              };
            }
            return qp;
          }),
          currentQuestNumber: Math.min(questNumber + 1, 8),
          pendingQuestComplete: {
            questNumber,
            questTitle: quest?.title || `Quest ${questNumber}`,
            xpEarned: actualXp,
          },
        }));
      },

      // Acknowledge quest completion (after celebration)
      acknowledgeQuestComplete: () => {
        set({ pendingQuestComplete: null });
      },

      // Get quest status
      getQuestStatus: (questNumber: number) => {
        const qp = get().questProgress.find((q) => q.questNumber === questNumber);
        return qp?.status ?? 'locked';
      },

      // Get full quest progress
      getQuestProgress: (questNumber: number) => {
        return get().questProgress.find((q) => q.questNumber === questNumber);
      },

      // Reset all progress
      reset: () => {
        set({
          questProgress: initialQuestProgress,
          currentQuestNumber: 1,
          isInitialized: false,
          pendingQuestComplete: null,
        });
      },
    }),
    {
      name: 'forgez-quest-progress',
    }
  )
);

// Selector hooks
export function useCurrentQuest(): Quest | undefined {
  const currentQuestNumber = useQuestStore((state) => state.currentQuestNumber);
  return QUESTS.find((q) => q.number === currentQuestNumber);
}

export function useQuestByNumber(questNumber: number): Quest | undefined {
  return QUESTS.find((q) => q.number === questNumber);
}

export function useTotalXP(): number {
  const questProgress = useQuestStore((state) => state.questProgress);
  return questProgress.reduce((total, qp) => total + qp.xpEarned, 0);
}

export function useCompletedQuestsCount(): number {
  const questProgress = useQuestStore((state) => state.questProgress);
  return questProgress.filter((qp) => qp.status === 'completed').length;
}
