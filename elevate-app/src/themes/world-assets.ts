// FORGE-Z Icon Mappings
// Maps to lucide-react icons for RPG-style navigation

import type { WorldId, WorldAssets } from './types';

export const worldAssets: Record<WorldId, WorldAssets> = {
  forgez: {
    heroIcon: 'Swords',
    navIcons: {
      dashboard: 'LayoutDashboard',
      skills: 'Sparkles',
      profile: 'UserCircle',
      settings: 'Settings',
      portfolio: 'Trophy',
      skillsBank: 'Vault',
      feedback: 'MessageCircle',
      teams: 'Users',
      careers: 'Building2',
      learn: 'Flame',
      compass: 'Map',
      quests: 'Scroll',
    },
    decorativeElements: ['Flame', 'Swords', 'Shield', 'Crown', 'Star'],
  },
};

// Helper to get assets (single world)
export function getWorldAssets(worldId: WorldId = 'forgez'): WorldAssets {
  return worldAssets[worldId];
}
