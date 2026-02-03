import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldId } from '@/themes/types';
import { DEFAULT_WORLD, getWorldConfig, worldLabels, worldThemes, worldAssets } from '@/themes';

interface WorldState {
  // State - single FORGE-Z theme
  currentWorld: WorldId;
  isLoading: boolean;

  // Actions
  setWorld: (worldId: WorldId) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set) => ({
      // Initial state - always FORGE-Z
      currentWorld: DEFAULT_WORLD,
      isLoading: false,

      // Actions - simplified for single theme
      setWorld: () => set({ currentWorld: 'forgez' }), // Always forgez
      setLoading: (loading) => set({ isLoading: loading }),
      reset: () => set({ currentWorld: DEFAULT_WORLD, isLoading: false }),
    }),
    {
      name: 'forgez-world',
    }
  )
);

// Hooks for accessing FORGE-Z theme data
export function useWorldTheme() {
  return worldThemes.forgez;
}

/**
 * Get FORGE-Z labels for RPG-style navigation
 */
export function useWorldLabels() {
  return worldLabels.forgez;
}

export function useWorldAssets() {
  return worldAssets.forgez;
}

export function useWorldConfig() {
  return getWorldConfig('forgez');
}
