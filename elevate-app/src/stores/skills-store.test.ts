import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useSkillsStore,
  useSkillsByCategory,
  useSkillsByVerificationLevel,
  usePrimarySkills,
  useTopSkills,
  useSkillStats,
} from './skills-store';
import type {
  SkillsTaxonomy,
  UserSkill,
  SkillEndorsement,
  UserSkillWithTaxonomy,
  SkillCategory,
  SkillVerificationLevel,
} from '@/lib/supabase/types';

// Helper to create a mock skill taxonomy
function createMockTaxonomy(overrides: Partial<SkillsTaxonomy> = {}): SkillsTaxonomy {
  return {
    id: `taxonomy-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Skill',
    description: 'A test skill',
    framework: 'FORGEZ',
    framework_id: null,
    category: 'SKILL',
    parent_skill_id: null,
    level_descriptors: null,
    alt_labels: null,
    related_occupations: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to create a mock user skill
function createMockUserSkill(overrides: Partial<UserSkill> = {}): UserSkill {
  return {
    id: `user-skill-${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user-123',
    skill_id: 'taxonomy-123',
    proficiency_level: 3,
    verification_level: 'SELF_ASSESSED',
    confidence_score: 0.8,
    evidence_count: 1,
    years_experience: null,
    last_used_date: null,
    is_primary: false,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to create a mock user skill with taxonomy
function createMockUserSkillWithTaxonomy(
  skillOverrides: Partial<UserSkill> = {},
  taxonomyOverrides: Partial<SkillsTaxonomy> = {}
): UserSkillWithTaxonomy {
  return {
    ...createMockUserSkill(skillOverrides),
    skill: createMockTaxonomy(taxonomyOverrides),
    endorsements: [],
  };
}

// Helper to create a mock endorsement
function createMockEndorsement(overrides: Partial<SkillEndorsement> = {}): SkillEndorsement {
  return {
    id: `endorsement-${Math.random().toString(36).substr(2, 9)}`,
    user_skill_id: 'user-skill-123',
    endorser_id: 'endorser-123',
    relationship: 'colleague',
    endorsement_text: 'Great skill!',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useSkillsStore', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('starts with empty taxonomy', () => {
      expect(useSkillsStore.getState().taxonomy).toEqual([]);
    });

    it('starts with taxonomyLoading false', () => {
      expect(useSkillsStore.getState().taxonomyLoading).toBe(false);
    });

    it('starts with empty userSkills', () => {
      expect(useSkillsStore.getState().userSkills).toEqual([]);
    });

    it('starts with userSkillsLoading false', () => {
      expect(useSkillsStore.getState().userSkillsLoading).toBe(false);
    });

    it('starts with null selectedSkill', () => {
      expect(useSkillsStore.getState().selectedSkill).toBeNull();
    });

    it('starts with null error', () => {
      expect(useSkillsStore.getState().error).toBeNull();
    });
  });

  describe('setTaxonomy', () => {
    it('sets taxonomy correctly', () => {
      const taxonomy = [createMockTaxonomy(), createMockTaxonomy()];
      act(() => {
        useSkillsStore.getState().setTaxonomy(taxonomy);
      });
      expect(useSkillsStore.getState().taxonomy).toEqual(taxonomy);
    });

    it('replaces existing taxonomy', () => {
      const taxonomy1 = [createMockTaxonomy()];
      const taxonomy2 = [createMockTaxonomy(), createMockTaxonomy()];
      act(() => {
        useSkillsStore.getState().setTaxonomy(taxonomy1);
        useSkillsStore.getState().setTaxonomy(taxonomy2);
      });
      expect(useSkillsStore.getState().taxonomy).toEqual(taxonomy2);
    });
  });

  describe('setTaxonomyLoading', () => {
    it('sets loading to true', () => {
      act(() => {
        useSkillsStore.getState().setTaxonomyLoading(true);
      });
      expect(useSkillsStore.getState().taxonomyLoading).toBe(true);
    });

    it('sets loading to false', () => {
      act(() => {
        useSkillsStore.getState().setTaxonomyLoading(true);
        useSkillsStore.getState().setTaxonomyLoading(false);
      });
      expect(useSkillsStore.getState().taxonomyLoading).toBe(false);
    });
  });

  describe('setUserSkills', () => {
    it('sets user skills correctly', () => {
      const skills = [createMockUserSkillWithTaxonomy(), createMockUserSkillWithTaxonomy()];
      act(() => {
        useSkillsStore.getState().setUserSkills(skills);
      });
      expect(useSkillsStore.getState().userSkills).toEqual(skills);
    });

    it('replaces existing skills', () => {
      const skills1 = [createMockUserSkillWithTaxonomy()];
      const skills2 = [createMockUserSkillWithTaxonomy(), createMockUserSkillWithTaxonomy()];
      act(() => {
        useSkillsStore.getState().setUserSkills(skills1);
        useSkillsStore.getState().setUserSkills(skills2);
      });
      expect(useSkillsStore.getState().userSkills).toEqual(skills2);
    });
  });

  describe('addUserSkill', () => {
    it('adds skill to list', () => {
      const skill = createMockUserSkillWithTaxonomy();
      act(() => {
        useSkillsStore.getState().addUserSkill(skill);
      });
      expect(useSkillsStore.getState().userSkills).toContainEqual(skill);
    });

    it('appends to existing skills', () => {
      const skill1 = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      const skill2 = createMockUserSkillWithTaxonomy({ id: 'skill-2' });
      act(() => {
        useSkillsStore.getState().addUserSkill(skill1);
        useSkillsStore.getState().addUserSkill(skill2);
      });
      expect(useSkillsStore.getState().userSkills).toHaveLength(2);
    });
  });

  describe('updateUserSkill', () => {
    it('updates skill in list', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1', proficiency_level: 3 });
      act(() => {
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().updateUserSkill('skill-1', { proficiency_level: 5 });
      });
      expect(useSkillsStore.getState().userSkills[0].proficiency_level).toBe(5);
    });

    it('updates selectedSkill if matching', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1', proficiency_level: 3 });
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().updateUserSkill('skill-1', { proficiency_level: 5 });
      });
      expect(useSkillsStore.getState().selectedSkill?.proficiency_level).toBe(5);
    });

    it('does not update selectedSkill if not matching', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1', proficiency_level: 3 });
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
        useSkillsStore.getState().updateUserSkill('skill-2', { proficiency_level: 5 });
      });
      expect(useSkillsStore.getState().selectedSkill?.proficiency_level).toBe(3);
    });
  });

  describe('removeUserSkill', () => {
    it('removes skill from list', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      act(() => {
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().removeUserSkill('skill-1');
      });
      expect(useSkillsStore.getState().userSkills).toEqual([]);
    });

    it('clears selectedSkill if matching', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
        useSkillsStore.getState().removeUserSkill('skill-1');
      });
      expect(useSkillsStore.getState().selectedSkill).toBeNull();
    });

    it('preserves selectedSkill if not matching', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
        useSkillsStore.getState().removeUserSkill('skill-2');
      });
      expect(useSkillsStore.getState().selectedSkill).not.toBeNull();
    });
  });

  describe('setUserSkillsLoading', () => {
    it('sets loading state', () => {
      act(() => {
        useSkillsStore.getState().setUserSkillsLoading(true);
      });
      expect(useSkillsStore.getState().userSkillsLoading).toBe(true);
    });
  });

  describe('addEndorsement', () => {
    it('adds endorsement to matching skill', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      const endorsement = createMockEndorsement({ user_skill_id: 'skill-1' });
      act(() => {
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().addEndorsement('skill-1', endorsement);
      });
      expect(useSkillsStore.getState().userSkills[0].endorsements).toContainEqual(endorsement);
    });

    it('appends to existing endorsements', () => {
      const existingEndorsement = createMockEndorsement({ id: 'end-1' });
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      skill.endorsements = [existingEndorsement];
      const newEndorsement = createMockEndorsement({ id: 'end-2' });
      act(() => {
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().addEndorsement('skill-1', newEndorsement);
      });
      expect(useSkillsStore.getState().userSkills[0].endorsements).toHaveLength(2);
    });

    it('handles skill with no endorsements array', () => {
      const skill = createMockUserSkillWithTaxonomy({ id: 'skill-1' });
      skill.endorsements = undefined;
      const endorsement = createMockEndorsement();
      act(() => {
        useSkillsStore.getState().setUserSkills([skill]);
        useSkillsStore.getState().addEndorsement('skill-1', endorsement);
      });
      expect(useSkillsStore.getState().userSkills[0].endorsements).toHaveLength(1);
    });
  });

  describe('setSelectedSkill', () => {
    it('sets selected skill', () => {
      const skill = createMockUserSkillWithTaxonomy();
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
      });
      expect(useSkillsStore.getState().selectedSkill).toEqual(skill);
    });

    it('can set to null', () => {
      const skill = createMockUserSkillWithTaxonomy();
      act(() => {
        useSkillsStore.getState().setSelectedSkill(skill);
        useSkillsStore.getState().setSelectedSkill(null);
      });
      expect(useSkillsStore.getState().selectedSkill).toBeNull();
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      act(() => {
        useSkillsStore.getState().setError('Test error');
      });
      expect(useSkillsStore.getState().error).toBe('Test error');
    });

    it('clears error with null', () => {
      act(() => {
        useSkillsStore.getState().setError('Test error');
        useSkillsStore.getState().setError(null);
      });
      expect(useSkillsStore.getState().error).toBeNull();
    });
  });

  describe('reset', () => {
    it('resets all state', () => {
      act(() => {
        useSkillsStore.getState().setTaxonomy([createMockTaxonomy()]);
        useSkillsStore.getState().setUserSkills([createMockUserSkillWithTaxonomy()]);
        useSkillsStore.getState().setSelectedSkill(createMockUserSkillWithTaxonomy());
        useSkillsStore.getState().setTaxonomyLoading(true);
        useSkillsStore.getState().setUserSkillsLoading(true);
        useSkillsStore.getState().setError('Error');
        useSkillsStore.getState().reset();
      });

      const state = useSkillsStore.getState();
      expect(state.taxonomy).toEqual([]);
      expect(state.userSkills).toEqual([]);
      expect(state.selectedSkill).toBeNull();
      expect(state.taxonomyLoading).toBe(false);
      expect(state.userSkillsLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

// ============================================================================
// Selector hook tests
// ============================================================================
describe('useSkillsByCategory', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  it('returns skills of specified category', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({}, { category: 'SKILL' }),
      createMockUserSkillWithTaxonomy({}, { category: 'KNOWLEDGE' }),
      createMockUserSkillWithTaxonomy({}, { category: 'SKILL' }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillsByCategory('SKILL'));
    expect(result.current).toHaveLength(2);
    expect(result.current.every((s) => s.skill.category === 'SKILL')).toBe(true);
  });

  it('returns empty array when no skills match', () => {
    const skills = [createMockUserSkillWithTaxonomy({}, { category: 'SKILL' })];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillsByCategory('KNOWLEDGE'));
    expect(result.current).toEqual([]);
  });
});

describe('useSkillsByVerificationLevel', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  it('returns skills of specified verification level', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ verification_level: 'SELF_ASSESSED' }),
      createMockUserSkillWithTaxonomy({ verification_level: 'PROJECT_VERIFIED' }),
      createMockUserSkillWithTaxonomy({ verification_level: 'SELF_ASSESSED' }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillsByVerificationLevel('SELF_ASSESSED'));
    expect(result.current).toHaveLength(2);
    expect(result.current.every((s) => s.verification_level === 'SELF_ASSESSED')).toBe(true);
  });
});

describe('usePrimarySkills', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  it('returns only primary skills', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ is_primary: true }),
      createMockUserSkillWithTaxonomy({ is_primary: false }),
      createMockUserSkillWithTaxonomy({ is_primary: true }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => usePrimarySkills());
    expect(result.current).toHaveLength(2);
    expect(result.current.every((s) => s.is_primary)).toBe(true);
  });
});

describe('useTopSkills', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  it('returns top skills by proficiency', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ proficiency_level: 3 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 5 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 1 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 4 }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useTopSkills(3));
    expect(result.current).toHaveLength(3);
    expect(result.current[0].proficiency_level).toBe(5);
    expect(result.current[1].proficiency_level).toBe(4);
    expect(result.current[2].proficiency_level).toBe(3);
  });

  it('defaults to 5 skills', () => {
    const skills = Array.from({ length: 10 }, (_, i) =>
      createMockUserSkillWithTaxonomy({ proficiency_level: i + 1 })
    );
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useTopSkills());
    expect(result.current).toHaveLength(5);
  });

  it('returns all skills if fewer than limit', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ proficiency_level: 3 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 5 }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useTopSkills(5));
    expect(result.current).toHaveLength(2);
  });
});

describe('useSkillStats', () => {
  beforeEach(() => {
    act(() => {
      useSkillsStore.getState().reset();
    });
  });

  it('returns correct stats structure', () => {
    const { result } = renderHook(() => useSkillStats());
    expect(result.current).toHaveProperty('totalSkills');
    expect(result.current).toHaveProperty('verifiedSkills');
    expect(result.current).toHaveProperty('avgProficiency');
    expect(result.current).toHaveProperty('totalEndorsements');
  });

  it('calculates totalSkills correctly', () => {
    const skills = [
      createMockUserSkillWithTaxonomy(),
      createMockUserSkillWithTaxonomy(),
      createMockUserSkillWithTaxonomy(),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillStats());
    expect(result.current.totalSkills).toBe(3);
  });

  it('calculates verifiedSkills correctly', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ verification_level: 'SELF_ASSESSED' }),
      createMockUserSkillWithTaxonomy({ verification_level: 'PROJECT_VERIFIED' }),
      createMockUserSkillWithTaxonomy({ verification_level: 'PEER_ENDORSED' }),
      createMockUserSkillWithTaxonomy({ verification_level: 'AI_ANALYZED' }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillStats());
    // Only PROJECT_VERIFIED and AI_ANALYZED are considered "verified"
    expect(result.current.verifiedSkills).toBe(2);
  });

  it('calculates avgProficiency correctly', () => {
    const skills = [
      createMockUserSkillWithTaxonomy({ proficiency_level: 2 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 4 }),
      createMockUserSkillWithTaxonomy({ proficiency_level: 6 }),
    ];
    act(() => {
      useSkillsStore.getState().setUserSkills(skills);
    });
    const { result } = renderHook(() => useSkillStats());
    expect(result.current.avgProficiency).toBe(4);
  });

  it('returns 0 avgProficiency for empty skills', () => {
    const { result } = renderHook(() => useSkillStats());
    expect(result.current.avgProficiency).toBe(0);
  });

  it('calculates totalEndorsements correctly', () => {
    const skill1 = createMockUserSkillWithTaxonomy();
    skill1.endorsements = [createMockEndorsement(), createMockEndorsement()];
    const skill2 = createMockUserSkillWithTaxonomy();
    skill2.endorsements = [createMockEndorsement()];
    const skill3 = createMockUserSkillWithTaxonomy();
    skill3.endorsements = [];

    act(() => {
      useSkillsStore.getState().setUserSkills([skill1, skill2, skill3]);
    });
    const { result } = renderHook(() => useSkillStats());
    expect(result.current.totalEndorsements).toBe(3);
  });
});
