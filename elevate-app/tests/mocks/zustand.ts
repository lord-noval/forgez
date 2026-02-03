import { vi, type Mock } from 'vitest';
import { act } from '@testing-library/react';
import type { StoreApi, UseBoundStore } from 'zustand';

// Helper to reset a Zustand store to its initial state
export function resetStore<T>(store: UseBoundStore<StoreApi<T>>) {
  const initialState = store.getState();
  act(() => {
    store.setState(initialState, true);
  });
}

// Create a mock Zustand store for testing
export function createMockStore<T extends object>(
  initialState: T,
  actions: Partial<T> = {}
): UseBoundStore<StoreApi<T>> {
  let state = { ...initialState, ...actions };

  const subscribers = new Set<(state: T) => void>();

  const store = ((selector?: (state: T) => unknown) => {
    if (selector) {
      return selector(state);
    }
    return state;
  }) as UseBoundStore<StoreApi<T>>;

  store.getState = () => state;

  store.setState = (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = replace ? (nextState as T) : { ...state, ...nextState };
    subscribers.forEach((subscriber) => subscriber(state));
  };

  store.subscribe = (listener: (state: T) => void) => {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  };

  store.getInitialState = () => initialState;

  return store;
}

// Helper to create action mocks
export function createActionMocks<T extends Record<string, unknown>>(
  actionNames: (keyof T)[]
): Record<keyof T, Mock> {
  return actionNames.reduce(
    (acc, name) => {
      acc[name] = vi.fn();
      return acc;
    },
    {} as Record<keyof T, Mock>
  );
}

// Test helper to get store actions
export function getStoreActions<T extends object>(
  store: UseBoundStore<StoreApi<T>>
): Partial<T> {
  const state = store.getState();
  const actions: Partial<T> = {};

  for (const key in state) {
    if (typeof state[key] === 'function') {
      actions[key] = state[key];
    }
  }

  return actions;
}

// Helper to wait for state changes
export async function waitForStateChange<T extends object>(
  store: UseBoundStore<StoreApi<T>>,
  predicate: (state: T) => boolean,
  timeout = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('Timeout waiting for state change'));
    }, timeout);

    const checkState = (state: T) => {
      if (predicate(state)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(state);
      }
    };

    // Check initial state
    const initialState = store.getState();
    if (predicate(initialState)) {
      clearTimeout(timeoutId);
      resolve(initialState);
      return;
    }

    const unsubscribe = store.subscribe(checkState);
  });
}

// Mock user store state
export const mockUserState = {
  user: null,
  isLoading: false,
  error: null,
  setUser: vi.fn(),
  updateUser: vi.fn(),
  addXp: vi.fn(),
  setStreak: vi.fn(),
  useFreeze: vi.fn().mockReturnValue(true),
  earnFreeze: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
};

// Mock habits store state
export const mockHabitsState = {
  todaysLogs: [],
  todaysChallenges: [],
  lastLogDate: null,
  isLoading: false,
  isSaving: false,
  setTodaysLogs: vi.fn(),
  addLog: vi.fn(),
  updateLog: vi.fn(),
  setTodaysChallenges: vi.fn(),
  updateChallengeProgress: vi.fn(),
  setLastLogDate: vi.fn(),
  setLoading: vi.fn(),
  setSaving: vi.fn(),
  reset: vi.fn(),
};

// Mock achievements store state
export const mockAchievementsState = {
  unlockedAchievements: [],
  notifications: [],
  isLoading: false,
  setUnlockedAchievements: vi.fn(),
  addUnlockedAchievement: vi.fn(),
  queueNotification: vi.fn(),
  showNextNotification: vi.fn().mockReturnValue(null),
  dismissNotification: vi.fn(),
  clearAllNotifications: vi.fn(),
  isUnlocked: vi.fn().mockReturnValue(false),
  getUnlockedCount: vi.fn().mockReturnValue(0),
  getUnlockedByRarity: vi.fn().mockReturnValue([]),
  setLoading: vi.fn(),
  reset: vi.fn(),
};

// Mock world store state
export const mockWorldState = {
  currentWorld: 'cosmos' as const,
  isLoading: false,
  setWorld: vi.fn(),
  setLoading: vi.fn(),
  reset: vi.fn(),
};

// Mock projects store state
export const mockProjectsState = {
  projects: [],
  currentProject: null,
  uploadProgress: {},
  isLoading: false,
  isSaving: false,
  error: null,
  setProjects: vi.fn(),
  addProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  setCurrentProject: vi.fn(),
  addArtifact: vi.fn(),
  updateArtifact: vi.fn(),
  deleteArtifact: vi.fn(),
  setUploadProgress: vi.fn(),
  clearUploadProgress: vi.fn(),
  clearAllUploads: vi.fn(),
  addProjectSkill: vi.fn(),
  removeProjectSkill: vi.fn(),
  setLoading: vi.fn(),
  setSaving: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
};

// Mock skills store state
export const mockSkillsState = {
  taxonomy: [],
  taxonomyLoading: false,
  userSkills: [],
  userSkillsLoading: false,
  selectedSkill: null,
  error: null,
  setTaxonomy: vi.fn(),
  setTaxonomyLoading: vi.fn(),
  setUserSkills: vi.fn(),
  addUserSkill: vi.fn(),
  updateUserSkill: vi.fn(),
  removeUserSkill: vi.fn(),
  setUserSkillsLoading: vi.fn(),
  addEndorsement: vi.fn(),
  setSelectedSkill: vi.fn(),
  setError: vi.fn(),
  reset: vi.fn(),
};

// Reset all mock stores
export function resetAllMockStores() {
  Object.values(mockUserState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
  Object.values(mockHabitsState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
  Object.values(mockAchievementsState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
  Object.values(mockWorldState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
  Object.values(mockProjectsState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
  Object.values(mockSkillsState).forEach((v) => typeof v === 'function' && vi.isMockFunction(v) && v.mockClear());
}
