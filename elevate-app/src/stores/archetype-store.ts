import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArchetypeId, GamePreference, DomainInterest, FocusArea, Archetype } from '@/themes/types';

// Archetype definitions
export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  BUILDER: {
    id: 'BUILDER',
    name: 'The Builder',
    tagline: 'Creating is understanding',
    description: 'You learn by doing. Whether it\'s code, circuits, or spacecraft, you want to build it with your own hands. You thrive in sandbox environments where you can experiment and iterate.',
    traits: ['Hands-on', 'Creative', 'Patient', 'Detail-oriented'],
    color: '#F97316', // Orange
    icon: 'Hammer',
  },
  STRATEGIST: {
    id: 'STRATEGIST',
    name: 'The Strategist',
    tagline: 'Planning is winning',
    description: 'You see the big picture. Complex systems, resource allocation, long-term planning - these excite you. You excel when you can think several moves ahead.',
    traits: ['Analytical', 'Systematic', 'Forward-thinking', 'Calculated'],
    color: '#3B82F6', // Blue
    icon: 'Lightbulb',
  },
  EXPLORER: {
    id: 'EXPLORER',
    name: 'The Explorer',
    tagline: 'Discovery is the goal',
    description: 'The unknown calls to you. Whether it\'s uncharted territory, new technologies, or untested ideas, you\'re driven by curiosity and the thrill of discovery.',
    traits: ['Curious', 'Adventurous', 'Open-minded', 'Adaptable'],
    color: '#22C55E', // Green
    icon: 'Compass',
  },
  COMPETITOR: {
    id: 'COMPETITOR',
    name: 'The Competitor',
    tagline: 'Excellence through challenge',
    description: 'You rise to competition. Benchmarks, leaderboards, and measurable goals drive you to be your best. You thrive under pressure and love to optimize.',
    traits: ['Driven', 'Focused', 'Resilient', 'Performance-oriented'],
    color: '#EF4444', // Red
    icon: 'Trophy',
  },
};

// Game preferences and their archetype mappings
export const GAME_PREFERENCES: Record<GamePreference, { label: string; description: string; archetype: ArchetypeId; icon: string }> = {
  sandbox: {
    label: 'Sandbox Games',
    description: 'Minecraft, Factorio, Kerbal Space Program - building and creating',
    archetype: 'BUILDER',
    icon: 'Hammer',
  },
  strategy: {
    label: 'Strategy Games',
    description: 'Civilization, XCOM, Stellaris - planning and managing',
    archetype: 'STRATEGIST',
    icon: 'Map',
  },
  adventure: {
    label: 'Adventure Games',
    description: 'Zelda, Mass Effect, Outer Wilds - exploring and discovering',
    archetype: 'EXPLORER',
    icon: 'Compass',
  },
  esports: {
    label: 'Competitive Games',
    description: 'League of Legends, Valorant, Rocket League - competing and winning',
    archetype: 'COMPETITOR',
    icon: 'Trophy',
  },
};

// Domain interests
export const DOMAIN_INTERESTS: Record<DomainInterest, { label: string; description: string; icon: string; color: string }> = {
  space: {
    label: 'Space & Aerospace',
    description: 'Satellites, rockets, exploration of the cosmos',
    icon: 'Rocket',
    color: '#6366F1',
  },
  energy: {
    label: 'Energy & Sustainability',
    description: 'Batteries, fusion, renewable energy systems',
    icon: 'Zap',
    color: '#22C55E',
  },
  robotics: {
    label: 'Robotics & Automation',
    description: 'Robots, AI systems, autonomous vehicles',
    icon: 'Bot',
    color: '#F97316',
  },
  defense: {
    label: 'Defense & Security',
    description: 'Aerospace, cybersecurity, defense technology',
    icon: 'Shield',
    color: '#3B82F6',
  },
};

// Focus areas
export const FOCUS_AREAS: Record<FocusArea, { label: string; description: string; icon: string }> = {
  how_works: {
    label: 'How It Works',
    description: 'I want to understand the physics and systems',
    icon: 'Atom',
  },
  how_build: {
    label: 'How to Build It',
    description: 'I want to learn how to create and manufacture',
    icon: 'Hammer',
  },
  who_makes: {
    label: 'Who Makes It',
    description: 'I want to know about the people and companies',
    icon: 'Users',
  },
  who_operates: {
    label: 'Who Operates It',
    description: 'I want to understand operations and deployment',
    icon: 'Settings',
  },
};

export interface ArchetypeQuizAnswers {
  gamePreference?: GamePreference;
  domainInterest?: DomainInterest;
  focusArea?: FocusArea;
  additionalAnswers?: Record<string, unknown>;
}

interface ArchetypeState {
  // State
  archetype: ArchetypeId | null;
  gamePreference: GamePreference | null;
  domainInterest: DomainInterest | null;
  focusArea: FocusArea | null;
  epicObjectId: string | null;
  quizAnswers: ArchetypeQuizAnswers;
  isComplete: boolean;

  // Actions
  setGamePreference: (preference: GamePreference) => void;
  setDomainInterest: (interest: DomainInterest) => void;
  setFocusArea: (area: FocusArea) => void;
  setEpicObjectId: (id: string) => void;
  calculateArchetype: () => ArchetypeId;
  completeQuiz: () => void;
  reset: () => void;
}

export const useArchetypeStore = create<ArchetypeState>()(
  persist(
    (set, get) => ({
      // Initial state
      archetype: null,
      gamePreference: null,
      domainInterest: null,
      focusArea: null,
      epicObjectId: null,
      quizAnswers: {},
      isComplete: false,

      // Set game preference and derive archetype
      setGamePreference: (preference: GamePreference) => {
        const archetype = GAME_PREFERENCES[preference].archetype;
        set({
          gamePreference: preference,
          archetype,
          quizAnswers: { ...get().quizAnswers, gamePreference: preference },
        });
      },

      // Set domain interest
      setDomainInterest: (interest: DomainInterest) => {
        set({
          domainInterest: interest,
          quizAnswers: { ...get().quizAnswers, domainInterest: interest },
        });
      },

      // Set focus area
      setFocusArea: (area: FocusArea) => {
        set({
          focusArea: area,
          quizAnswers: { ...get().quizAnswers, focusArea: area },
        });
      },

      // Set matched epic object
      setEpicObjectId: (id: string) => {
        set({ epicObjectId: id });
      },

      // Calculate archetype from game preference
      calculateArchetype: () => {
        const { gamePreference } = get();
        if (!gamePreference) return 'BUILDER'; // Default
        return GAME_PREFERENCES[gamePreference].archetype;
      },

      // Mark quiz as complete
      completeQuiz: () => {
        const archetype = get().calculateArchetype();
        set({ isComplete: true, archetype });
      },

      // Reset
      reset: () => {
        set({
          archetype: null,
          gamePreference: null,
          domainInterest: null,
          focusArea: null,
          epicObjectId: null,
          quizAnswers: {},
          isComplete: false,
        });
      },
    }),
    {
      name: 'forgez-archetype',
    }
  )
);

// Selector hooks
export function useArchetype(): Archetype | null {
  const archetypeId = useArchetypeStore((state) => state.archetype);
  return archetypeId ? ARCHETYPES[archetypeId] : null;
}

export function useIsArchetypeComplete(): boolean {
  return useArchetypeStore((state) => state.isComplete);
}
