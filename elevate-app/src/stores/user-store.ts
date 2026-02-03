import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  // Personal information
  firstName: string | null;
  lastName: string | null;
  birthday: string | null;
  phoneNumber: string | null;
  phoneCountryCode: string | null;
  // Profile fields
  headline: string | null;
  bio: string | null;
  location: string | null;
  timezone: string;
  darkMode: boolean;
  reminderTime: string | null;
  onboardingCompleted: boolean;
  isEmployer: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
}

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user, error: null }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: "elevate-user",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
