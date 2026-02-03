import { vi } from 'vitest';
import type { User, Project, UserSkill, SkillsTaxonomy } from '@/lib/supabase/types';

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/file.png' } }),
      createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test.com/signed' }, error: null }),
      createSignedUploadUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://test.com/upload', path: 'path', token: 'token' }, error: null }),
    }),
  },
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
};

// Factory functions for creating mock data
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    avatar_url: null,
    total_xp: 1000,
    current_level: 5,
    current_streak: 7,
    longest_streak: 14,
    freeze_tokens: 2,
    timezone: 'UTC',
    dark_mode: true,
    reminder_time: null,
    onboarding_completed: true,
    primary_skill_id: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    headline: null,
    bio: null,
    location: null,
    linkedin_url: null,
    github_url: null,
    portfolio_url: null,
    active_world_id: null,
    current_role: null,
    current_company: null,
    years_experience: null,
    is_open_to_work: false,
    job_search_status: null,
    profile_visibility: 'public',
    show_skills_publicly: true,
    show_projects_publicly: true,
    is_employer: false,
    employer_company_id: null,
    ...overrides,
  };
}

export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-123',
    user_id: 'user-123',
    title: 'Test Project',
    description: 'A test project description',
    project_type: 'CODE',
    thumbnail_url: null,
    external_url: null,
    repository_url: null,
    start_date: '2024-01-01',
    end_date: null,
    is_ongoing: true,
    visibility: 'public',
    is_featured: false,
    view_count: 0,
    tags: ['typescript', 'react'],
    metadata: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockSkillTaxonomy(overrides: Partial<SkillsTaxonomy> = {}): SkillsTaxonomy {
  return {
    id: 'skill-123',
    name: 'TypeScript',
    description: 'TypeScript programming language',
    framework: 'FORGEZ',
    framework_id: null,
    category: 'SKILL',
    parent_skill_id: null,
    level_descriptors: null,
    alt_labels: ['TS'],
    related_occupations: ['Software Developer'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockUserSkill(overrides: Partial<UserSkill> = {}): UserSkill {
  return {
    id: 'user-skill-123',
    user_id: 'user-123',
    skill_id: 'skill-123',
    proficiency_level: 3,
    verification_level: 'SELF_ASSESSED',
    confidence_score: 0.8,
    evidence_count: 2,
    years_experience: 2,
    last_used_date: '2024-01-01',
    is_primary: false,
    notes: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Reset all mocks
export function resetSupabaseMocks() {
  vi.clearAllMocks();
}
