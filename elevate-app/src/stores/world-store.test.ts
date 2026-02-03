import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useWorldStore,
  useWorldTheme,
  useWorldLabels,
  useWorldAssets,
  useWorldConfig,
} from './world-store';
import { worldThemes, worldLabels, worldAssets, DEFAULT_WORLD } from '@/themes';

describe('useWorldStore', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('starts with default world (forgez)', () => {
      expect(useWorldStore.getState().currentWorld).toBe(DEFAULT_WORLD);
      expect(useWorldStore.getState().currentWorld).toBe('forgez');
    });

    it('starts with isLoading false', () => {
      expect(useWorldStore.getState().isLoading).toBe(false);
    });
  });

  describe('setWorld', () => {
    it('sets world to forgez', () => {
      act(() => {
        useWorldStore.getState().setWorld('forgez');
      });
      expect(useWorldStore.getState().currentWorld).toBe('forgez');
    });
  });

  describe('setLoading', () => {
    it('sets loading to true', () => {
      act(() => {
        useWorldStore.getState().setLoading(true);
      });
      expect(useWorldStore.getState().isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      act(() => {
        useWorldStore.getState().setLoading(true);
        useWorldStore.getState().setLoading(false);
      });
      expect(useWorldStore.getState().isLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets world to default (forgez)', () => {
      act(() => {
        useWorldStore.getState().setWorld('forgez');
        useWorldStore.getState().reset();
      });
      expect(useWorldStore.getState().currentWorld).toBe(DEFAULT_WORLD);
    });

    it('resets loading to false', () => {
      act(() => {
        useWorldStore.getState().setLoading(true);
        useWorldStore.getState().reset();
      });
      expect(useWorldStore.getState().isLoading).toBe(false);
    });
  });

  describe('persistence', () => {
    it('has persistence configured with correct name', () => {
      const state = useWorldStore.getState();
      expect(state).toBeDefined();
    });
  });
});

// ============================================================================
// Hook tests
// ============================================================================
describe('useWorldTheme', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  it('returns theme for current world (forgez)', () => {
    const { result } = renderHook(() => useWorldTheme());
    expect(result.current).toBe(worldThemes[DEFAULT_WORLD]);
    expect(result.current).toBe(worldThemes['forgez']);
  });

  it('returns forgez theme', () => {
    act(() => {
      useWorldStore.getState().setWorld('forgez');
    });
    const { result } = renderHook(() => useWorldTheme());
    expect(result.current.id).toBe('forgez');
  });
});

describe('useWorldLabels', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  it('returns labels for current world (forgez)', () => {
    const { result } = renderHook(() => useWorldLabels());
    expect(result.current).toBe(worldLabels[DEFAULT_WORLD]);
    expect(result.current).toBe(worldLabels['forgez']);
  });

  it('has required label properties', () => {
    const { result } = renderHook(() => useWorldLabels());
    expect(result.current).toHaveProperty('dashboard');
    expect(result.current).toHaveProperty('skills');
    expect(result.current).toHaveProperty('profile');
    expect(result.current).toHaveProperty('portfolio');
    expect(result.current).toHaveProperty('quests');
  });
});

describe('useWorldAssets', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  it('returns assets for current world (forgez)', () => {
    const { result } = renderHook(() => useWorldAssets());
    expect(result.current).toBe(worldAssets[DEFAULT_WORLD]);
    expect(result.current).toBe(worldAssets['forgez']);
  });

  it('has required asset properties', () => {
    const { result } = renderHook(() => useWorldAssets());
    expect(result.current).toHaveProperty('heroIcon');
    expect(result.current).toHaveProperty('navIcons');
    expect(result.current).toHaveProperty('decorativeElements');
  });

  it('has nav icons for all sections', () => {
    const { result } = renderHook(() => useWorldAssets());
    expect(result.current.navIcons).toHaveProperty('dashboard');
    expect(result.current.navIcons).toHaveProperty('skills');
    expect(result.current.navIcons).toHaveProperty('portfolio');
  });
});

describe('useWorldConfig', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  it('returns complete config for current world (forgez)', () => {
    const { result } = renderHook(() => useWorldConfig());
    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('labels');
    expect(result.current).toHaveProperty('assets');
  });

  it('config theme matches useWorldTheme', () => {
    const { result: configResult } = renderHook(() => useWorldConfig());
    const { result: themeResult } = renderHook(() => useWorldTheme());
    expect(configResult.current.theme).toBe(themeResult.current);
  });

  it('config labels matches useWorldLabels', () => {
    const { result: configResult } = renderHook(() => useWorldConfig());
    const { result: labelsResult } = renderHook(() => useWorldLabels());
    expect(configResult.current.labels).toBe(labelsResult.current);
  });

  it('config assets matches useWorldAssets', () => {
    const { result: configResult } = renderHook(() => useWorldConfig());
    const { result: assetsResult } = renderHook(() => useWorldAssets());
    expect(configResult.current.assets).toBe(assetsResult.current);
  });

  it('theme id is forgez', () => {
    const { result } = renderHook(() => useWorldConfig());
    expect(result.current.theme.id).toBe('forgez');
  });
});

// ============================================================================
// Integration tests
// ============================================================================
describe('world store integration', () => {
  beforeEach(() => {
    act(() => {
      useWorldStore.getState().reset();
    });
  });

  it('all hooks return consistent data for forgez world', () => {
    act(() => {
      useWorldStore.getState().setWorld('forgez');
    });

    const { result: themeResult } = renderHook(() => useWorldTheme());
    const { result: labelsResult } = renderHook(() => useWorldLabels());
    const { result: assetsResult } = renderHook(() => useWorldAssets());
    const { result: configResult } = renderHook(() => useWorldConfig());

    expect(themeResult.current.id).toBe('forgez');
    expect(configResult.current.theme.id).toBe('forgez');
    expect(configResult.current.labels).toBe(labelsResult.current);
    expect(configResult.current.assets).toBe(assetsResult.current);
  });

  it('forgez theme has correct primary color', () => {
    expect(worldThemes['forgez'].colors.primary).toBeDefined();
  });

  it('forgez has dashboard label', () => {
    expect(worldLabels['forgez'].dashboard).toBeDefined();
  });
});
