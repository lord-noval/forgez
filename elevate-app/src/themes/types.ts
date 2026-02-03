// FORGE-Z Theme Types
// Single unified theme for the RPG career exploration platform

export type WorldId = 'forgez';

export interface WorldTheme {
  id: WorldId;
  name: string;
  tagline: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    foreground: string;
    foregroundMuted: string;
    success: string;
    warning: string;
    danger: string;
    achievement: string;
    xp: string;
  };
  icon: string;
  backgroundPattern: string;
}

export interface WorldLabels {
  // Navigation - RPG terminology
  dashboard: string;
  skills: string;
  profile: string;
  settings: string;
  portfolio: string;
  skillsBank: string;
  feedback: string;
  teams: string;
  careers: string;
  learn: string;
  compass: string;
  quests: string;

  // Actions
  startJourney: string;
  continueJourney: string;
  viewProgress: string;

  // Greetings
  welcomeMessage: string;
  dailyGreeting: string;
}

export interface WorldAssets {
  heroIcon: string;
  navIcons: {
    dashboard: string;
    skills: string;
    profile: string;
    settings: string;
    portfolio: string;
    skillsBank: string;
    feedback: string;
    teams: string;
    careers: string;
    learn: string;
    compass: string;
    quests: string;
  };
  decorativeElements: string[];
}

export interface WorldConfig {
  theme: WorldTheme;
  labels: WorldLabels;
  assets: WorldAssets;
}

// Quest types
export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface Quest {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  xpReward: number;
  icon: string;
}

// Archetype types
export type ArchetypeId = 'BUILDER' | 'STRATEGIST' | 'EXPLORER' | 'COMPETITOR';
export type GamePreference = 'sandbox' | 'strategy' | 'adventure' | 'esports';
export type DomainInterest = 'space' | 'energy' | 'robotics' | 'defense';
export type FocusArea = 'how_works' | 'how_build' | 'who_makes' | 'who_operates';

export interface Archetype {
  id: ArchetypeId;
  name: string;
  tagline: string;
  description: string;
  traits: string[];
  color: string;
  icon: string;
}
