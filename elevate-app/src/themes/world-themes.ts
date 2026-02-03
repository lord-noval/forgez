// FORGE-Z Theme Color Definitions
// Single unified theme for the RPG career exploration platform

import type { WorldId, WorldTheme } from './types';

export const worldThemes: Record<WorldId, WorldTheme> = {
  forgez: {
    id: 'forgez',
    name: 'FORGE-Z',
    tagline: 'Forge Your Future',
    description: 'An RPG-style journey through career discovery. Complete quests, earn XP, and unlock your potential in the world of engineering and technology.',
    colors: {
      primary: '#F97316',      // Fire orange - main brand
      secondary: '#EAB308',    // Molten gold - accents
      accent: '#22D3EE',       // Cyan - highlights and XP
      background: '#0D0907',   // Deep charcoal
      backgroundSecondary: '#1A1210',
      backgroundTertiary: '#261A14',
      foreground: '#FEF3C7',   // Warm white
      foregroundMuted: '#D4A574',
      success: '#84CC16',      // Level up green
      warning: '#FB923C',      // Quest warning
      danger: '#DC2626',       // Failed red
      achievement: '#F59E0B',  // Gold medal
      xp: '#22D3EE',           // XP cyan glow
    },
    icon: 'Swords',
    backgroundPattern: 'forge',
  },
};

// Get CSS variables for the FORGE-Z theme
export function getWorldCSSVariables(worldId: WorldId = 'forgez'): Record<string, string> {
  const theme = worldThemes[worldId];
  return {
    '--world-primary': theme.colors.primary,
    '--world-secondary': theme.colors.secondary,
    '--world-accent': theme.colors.accent,
    '--world-background': theme.colors.background,
    '--world-background-secondary': theme.colors.backgroundSecondary,
    '--world-background-tertiary': theme.colors.backgroundTertiary,
    '--world-foreground': theme.colors.foreground,
    '--world-foreground-muted': theme.colors.foregroundMuted,
    '--world-success': theme.colors.success,
    '--world-warning': theme.colors.warning,
    '--world-danger': theme.colors.danger,
    '--world-achievement': theme.colors.achievement,
    '--world-xp': theme.colors.xp,
  };
}

// FORGE-Z is the only and default world
export const DEFAULT_WORLD: WorldId = 'forgez';
