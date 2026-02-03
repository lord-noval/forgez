// FORGE-Z Theme System
// Export all theme-related utilities for the single FORGE-Z theme

export * from './types';
export * from './world-themes';
export * from './world-labels';
export * from './world-assets';

import type { WorldId, WorldConfig } from './types';
import { worldThemes, DEFAULT_WORLD } from './world-themes';
import { worldLabels } from './world-labels';
import { worldAssets } from './world-assets';

// Get complete FORGE-Z configuration
export function getWorldConfig(worldId: WorldId = 'forgez'): WorldConfig {
  return {
    theme: worldThemes[worldId],
    labels: worldLabels[worldId],
    assets: worldAssets[worldId],
  };
}

// Get all available worlds (just FORGE-Z now)
export function getAllWorlds(): WorldId[] {
  return ['forgez'];
}

// Validate world ID (always true for 'forgez')
export function isValidWorldId(id: string): id is WorldId {
  return id === 'forgez';
}

// Re-export default
export { DEFAULT_WORLD };
