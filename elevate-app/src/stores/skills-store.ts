import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  SkillsTaxonomy,
  UserSkill,
  SkillEndorsement,
  UserSkillWithTaxonomy,
  SkillCategory,
  SkillVerificationLevel,
} from '@/lib/supabase/types';

interface SkillsState {
  // Taxonomy
  taxonomy: SkillsTaxonomy[];
  taxonomyLoading: boolean;

  // User skills
  userSkills: UserSkillWithTaxonomy[];
  userSkillsLoading: boolean;

  // Selected skill for detail view
  selectedSkill: UserSkillWithTaxonomy | null;

  // Error state
  error: string | null;

  // Taxonomy actions
  setTaxonomy: (skills: SkillsTaxonomy[]) => void;
  setTaxonomyLoading: (loading: boolean) => void;

  // User skills actions
  setUserSkills: (skills: UserSkillWithTaxonomy[]) => void;
  addUserSkill: (skill: UserSkillWithTaxonomy) => void;
  updateUserSkill: (skillId: string, updates: Partial<UserSkill>) => void;
  removeUserSkill: (skillId: string) => void;
  setUserSkillsLoading: (loading: boolean) => void;

  // Endorsement actions
  addEndorsement: (userSkillId: string, endorsement: SkillEndorsement) => void;

  // Selection
  setSelectedSkill: (skill: UserSkillWithTaxonomy | null) => void;

  // Error
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  taxonomy: [],
  taxonomyLoading: false,
  userSkills: [],
  userSkillsLoading: false,
  selectedSkill: null,
  error: null,
};

export const useSkillsStore = create<SkillsState>()((set) => ({
  ...initialState,

  // Taxonomy actions
  setTaxonomy: (skills) => set({ taxonomy: skills }),
  setTaxonomyLoading: (loading) => set({ taxonomyLoading: loading }),

  // User skills actions
  setUserSkills: (skills) => set({ userSkills: skills }),

  addUserSkill: (skill) =>
    set((state) => ({
      userSkills: [...state.userSkills, skill],
    })),

  updateUserSkill: (skillId, updates) =>
    set((state) => ({
      userSkills: state.userSkills.map((s) =>
        s.id === skillId ? { ...s, ...updates } : s
      ),
      selectedSkill:
        state.selectedSkill?.id === skillId
          ? { ...state.selectedSkill, ...updates }
          : state.selectedSkill,
    })),

  removeUserSkill: (skillId) =>
    set((state) => ({
      userSkills: state.userSkills.filter((s) => s.id !== skillId),
      selectedSkill:
        state.selectedSkill?.id === skillId ? null : state.selectedSkill,
    })),

  setUserSkillsLoading: (loading) => set({ userSkillsLoading: loading }),

  // Endorsement actions
  addEndorsement: (userSkillId, endorsement) =>
    set((state) => ({
      userSkills: state.userSkills.map((s) =>
        s.id === userSkillId
          ? { ...s, endorsements: [...(s.endorsements || []), endorsement] }
          : s
      ),
    })),

  // Selection
  setSelectedSkill: (skill) => set({ selectedSkill: skill }),

  // Error
  setError: (error) => set({ error }),

  // Reset
  reset: () => set(initialState),
}));

// Selectors - use useMemo for computed values to ensure stable references with React 19 SSR
export function useSkillsByCategory(category: SkillCategory): UserSkillWithTaxonomy[] {
  const userSkills = useSkillsStore((state) => state.userSkills);
  return useMemo(
    () => userSkills.filter((s) => s.skill.category === category),
    [userSkills, category]
  );
}

export function useSkillsByVerificationLevel(level: SkillVerificationLevel): UserSkillWithTaxonomy[] {
  const userSkills = useSkillsStore((state) => state.userSkills);
  return useMemo(
    () => userSkills.filter((s) => s.verification_level === level),
    [userSkills, level]
  );
}

export function usePrimarySkills(): UserSkillWithTaxonomy[] {
  const userSkills = useSkillsStore((state) => state.userSkills);
  return useMemo(
    () => userSkills.filter((s) => s.is_primary),
    [userSkills]
  );
}

export function useTopSkills(limit: number = 5): UserSkillWithTaxonomy[] {
  const userSkills = useSkillsStore((state) => state.userSkills);
  return useMemo(
    () =>
      [...userSkills]
        .sort((a, b) => b.proficiency_level - a.proficiency_level)
        .slice(0, limit),
    [userSkills, limit]
  );
}

interface SkillStats {
  totalSkills: number;
  verifiedSkills: number;
  avgProficiency: number;
  totalEndorsements: number;
}

export function useSkillStats(): SkillStats {
  const userSkills = useSkillsStore((state) => state.userSkills);
  return useMemo(() => {
    const totalSkills = userSkills.length;
    const verifiedSkills = userSkills.filter(
      (s) =>
        s.verification_level !== 'SELF_ASSESSED' &&
        s.verification_level !== 'PEER_ENDORSED'
    ).length;
    const avgProficiency =
      userSkills.length > 0
        ? userSkills.reduce((acc, s) => acc + s.proficiency_level, 0) / userSkills.length
        : 0;
    const totalEndorsements = userSkills.reduce(
      (acc, s) => acc + (s.endorsements?.length || 0),
      0
    );

    return {
      totalSkills,
      verifiedSkills,
      avgProficiency,
      totalEndorsements,
    };
  }, [userSkills]);
}
