'use client';

import { useEffect } from 'react';
import { useWorldStore } from '@/stores/world-store';
import type { WorldId } from '@/themes/types';

interface WorldProviderProps {
  children: React.ReactNode;
  initialWorld?: WorldId;
}

export function WorldProvider({ children, initialWorld }: WorldProviderProps) {
  const { currentWorld, setWorld } = useWorldStore();

  // Apply data-world attribute to document
  useEffect(() => {
    const worldToApply = initialWorld || currentWorld;

    // Apply world attribute to html element
    document.documentElement.setAttribute('data-world', worldToApply);

    // If initial world differs from store, sync them
    if (initialWorld && initialWorld !== currentWorld) {
      setWorld(initialWorld);
    }

    // Cleanup on unmount
    return () => {
      // Keep the attribute, don't remove on unmount
    };
  }, [currentWorld, initialWorld, setWorld]);

  // Watch for changes and update DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-world', currentWorld);
  }, [currentWorld]);

  return <>{children}</>;
}

// Hook to manually switch worlds with animation
export function useWorldSwitcher() {
  const { setWorld } = useWorldStore();

  const switchWorld = (newWorld: WorldId) => {
    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transitioning');

    // Update the world
    setWorld(newWorld);

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 300);
  };

  return { switchWorld };
}
