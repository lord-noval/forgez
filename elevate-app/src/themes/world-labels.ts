// FORGE-Z RPG Labels and Terminology
// Single unified theme with RPG-style navigation labels

import type { WorldId, WorldLabels } from './types';

export const worldLabels: Record<WorldId, WorldLabels> = {
  forgez: {
    // Navigation - RPG style
    dashboard: 'Command Center',
    skills: 'Skill Tree',
    profile: 'Hero Profile',
    settings: 'Settings',
    portfolio: 'Achievements',
    skillsBank: 'Skill Vault',
    feedback: 'Guild Reviews',
    teams: 'Party Finder',
    careers: 'Guild Hall',
    learn: 'Skill Forge',
    compass: 'Quest Map',
    quests: 'Quests',

    // Actions
    startJourney: 'Begin Quest',
    continueJourney: 'Continue Quest',
    viewProgress: 'View Progress',

    // Greetings
    welcomeMessage: 'Welcome back, Adventurer',
    dailyGreeting: 'Ready for your next quest?',
  },
};

// Helper to get labels (single world)
export function getWorldLabels(worldId: WorldId = 'forgez'): WorldLabels {
  return worldLabels[worldId];
}
