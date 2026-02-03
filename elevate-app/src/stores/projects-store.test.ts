import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useProjectsStore,
  useProjectById,
  usePublicProjects,
  useFeaturedProjects,
  useProjectsByType,
  useActiveUploads,
} from './projects-store';
import type { Project, ProjectArtifact, ProjectSkill, ProjectWithArtifacts } from '@/lib/supabase/types';

// Helper to create a mock project
function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: `project-${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'user-123',
    title: 'Test Project',
    description: 'A test project',
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
    tags: ['test'],
    metadata: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to create a mock artifact
function createMockArtifact(overrides: Partial<ProjectArtifact> = {}): ProjectArtifact {
  return {
    id: `artifact-${Math.random().toString(36).substr(2, 9)}`,
    project_id: 'project-123',
    file_name: 'test.ts',
    file_path: '/uploads/test.ts',
    file_type: 'CODE',
    file_size: 1024,
    mime_type: 'text/typescript',
    upload_status: 'COMPLETED',
    storage_bucket: 'project-files',
    analysis_status: 'COMPLETED',
    analysis_result: null,
    metadata: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to create a mock project with artifacts
function createMockProjectWithArtifacts(
  projectOverrides: Partial<Project> = {},
  artifacts: ProjectArtifact[] = []
): ProjectWithArtifacts {
  return {
    ...createMockProject(projectOverrides),
    artifacts,
    extracted_skills: [],
  };
}

describe('useProjectsStore', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  describe('initial state', () => {
    it('starts with empty projects', () => {
      expect(useProjectsStore.getState().projects).toEqual([]);
    });

    it('starts with null currentProject', () => {
      expect(useProjectsStore.getState().currentProject).toBeNull();
    });

    it('starts with empty uploadProgress', () => {
      expect(useProjectsStore.getState().uploadProgress).toEqual({});
    });

    it('starts with isLoading false', () => {
      expect(useProjectsStore.getState().isLoading).toBe(false);
    });

    it('starts with isSaving false', () => {
      expect(useProjectsStore.getState().isSaving).toBe(false);
    });

    it('starts with null error', () => {
      expect(useProjectsStore.getState().error).toBeNull();
    });
  });

  describe('setProjects', () => {
    it('sets projects correctly', () => {
      const projects = [createMockProject(), createMockProject()];
      act(() => {
        useProjectsStore.getState().setProjects(projects);
      });
      expect(useProjectsStore.getState().projects).toEqual(projects);
    });

    it('replaces existing projects', () => {
      const projects1 = [createMockProject()];
      const projects2 = [createMockProject(), createMockProject()];
      act(() => {
        useProjectsStore.getState().setProjects(projects1);
        useProjectsStore.getState().setProjects(projects2);
      });
      expect(useProjectsStore.getState().projects).toEqual(projects2);
    });
  });

  describe('addProject', () => {
    it('adds project to beginning of list', () => {
      const project = createMockProject({ id: 'new-project' });
      act(() => {
        useProjectsStore.getState().addProject(project);
      });
      expect(useProjectsStore.getState().projects[0]).toEqual(project);
    });

    it('prepends to existing projects', () => {
      const project1 = createMockProject({ id: 'project-1' });
      const project2 = createMockProject({ id: 'project-2' });
      act(() => {
        useProjectsStore.getState().addProject(project1);
        useProjectsStore.getState().addProject(project2);
      });
      expect(useProjectsStore.getState().projects[0].id).toBe('project-2');
      expect(useProjectsStore.getState().projects[1].id).toBe('project-1');
    });
  });

  describe('updateProject', () => {
    it('updates project in list', () => {
      const project = createMockProject({ id: 'project-1', title: 'Original' });
      act(() => {
        useProjectsStore.getState().setProjects([project]);
        useProjectsStore.getState().updateProject('project-1', { title: 'Updated' });
      });
      expect(useProjectsStore.getState().projects[0].title).toBe('Updated');
    });

    it('updates currentProject if matching', () => {
      const project = createMockProjectWithArtifacts({ id: 'project-1', title: 'Original' });
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().updateProject('project-1', { title: 'Updated' });
      });
      expect(useProjectsStore.getState().currentProject?.title).toBe('Updated');
    });

    it('does not update currentProject if not matching', () => {
      const project = createMockProjectWithArtifacts({ id: 'project-1', title: 'Original' });
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().updateProject('project-2', { title: 'Updated' });
      });
      expect(useProjectsStore.getState().currentProject?.title).toBe('Original');
    });
  });

  describe('deleteProject', () => {
    it('removes project from list', () => {
      const project = createMockProject({ id: 'project-1' });
      act(() => {
        useProjectsStore.getState().setProjects([project]);
        useProjectsStore.getState().deleteProject('project-1');
      });
      expect(useProjectsStore.getState().projects).toEqual([]);
    });

    it('clears currentProject if matching', () => {
      const project = createMockProjectWithArtifacts({ id: 'project-1' });
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().deleteProject('project-1');
      });
      expect(useProjectsStore.getState().currentProject).toBeNull();
    });

    it('preserves currentProject if not matching', () => {
      const project = createMockProjectWithArtifacts({ id: 'project-1' });
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().deleteProject('project-2');
      });
      expect(useProjectsStore.getState().currentProject).not.toBeNull();
    });
  });

  describe('setCurrentProject', () => {
    it('sets current project', () => {
      const project = createMockProjectWithArtifacts();
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
      });
      expect(useProjectsStore.getState().currentProject).toEqual(project);
    });

    it('can set to null', () => {
      const project = createMockProjectWithArtifacts();
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().setCurrentProject(null);
      });
      expect(useProjectsStore.getState().currentProject).toBeNull();
    });
  });

  describe('addArtifact', () => {
    it('adds artifact to currentProject', () => {
      const project = createMockProjectWithArtifacts({ id: 'project-1' }, []);
      const artifact = createMockArtifact();
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().addArtifact(artifact);
      });
      expect(useProjectsStore.getState().currentProject?.artifacts).toContainEqual(artifact);
    });

    it('does nothing if no currentProject', () => {
      const artifact = createMockArtifact();
      act(() => {
        useProjectsStore.getState().addArtifact(artifact);
      });
      expect(useProjectsStore.getState().currentProject).toBeNull();
    });

    it('appends to existing artifacts', () => {
      const existingArtifact = createMockArtifact({ id: 'artifact-1' });
      const newArtifact = createMockArtifact({ id: 'artifact-2' });
      const project = createMockProjectWithArtifacts({}, [existingArtifact]);
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().addArtifact(newArtifact);
      });
      expect(useProjectsStore.getState().currentProject?.artifacts).toHaveLength(2);
    });
  });

  describe('updateArtifact', () => {
    it('updates artifact in currentProject', () => {
      const artifact = createMockArtifact({ id: 'artifact-1', file_name: 'original.ts' });
      const project = createMockProjectWithArtifacts({}, [artifact]);
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().updateArtifact('artifact-1', { file_name: 'updated.ts' });
      });
      expect(useProjectsStore.getState().currentProject?.artifacts[0].file_name).toBe('updated.ts');
    });

    it('does nothing if no currentProject', () => {
      act(() => {
        useProjectsStore.getState().updateArtifact('artifact-1', { file_name: 'updated.ts' });
      });
      expect(useProjectsStore.getState().currentProject).toBeNull();
    });
  });

  describe('deleteArtifact', () => {
    it('removes artifact from currentProject', () => {
      const artifact = createMockArtifact({ id: 'artifact-1' });
      const project = createMockProjectWithArtifacts({}, [artifact]);
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().deleteArtifact('artifact-1');
      });
      expect(useProjectsStore.getState().currentProject?.artifacts).toEqual([]);
    });
  });

  describe('upload progress', () => {
    it('sets upload progress', () => {
      act(() => {
        useProjectsStore.getState().setUploadProgress('artifact-1', {
          artifactId: 'artifact-1',
          fileName: 'test.ts',
          progress: 50,
          status: 'PROCESSING',
        });
      });
      expect(useProjectsStore.getState().uploadProgress['artifact-1'].progress).toBe(50);
    });

    it('clears single upload progress', () => {
      act(() => {
        useProjectsStore.getState().setUploadProgress('artifact-1', {
          artifactId: 'artifact-1',
          fileName: 'test.ts',
          progress: 100,
          status: 'COMPLETED',
        });
        useProjectsStore.getState().clearUploadProgress('artifact-1');
      });
      expect(useProjectsStore.getState().uploadProgress['artifact-1']).toBeUndefined();
    });

    it('clears all uploads', () => {
      act(() => {
        useProjectsStore.getState().setUploadProgress('artifact-1', {
          artifactId: 'artifact-1',
          fileName: 'test1.ts',
          progress: 100,
          status: 'COMPLETED',
        });
        useProjectsStore.getState().setUploadProgress('artifact-2', {
          artifactId: 'artifact-2',
          fileName: 'test2.ts',
          progress: 50,
          status: 'PROCESSING',
        });
        useProjectsStore.getState().clearAllUploads();
      });
      expect(useProjectsStore.getState().uploadProgress).toEqual({});
    });
  });

  describe('skills actions', () => {
    it('adds project skill', () => {
      const project = createMockProjectWithArtifacts();
      const skill: ProjectSkill = {
        id: 'skill-1',
        project_id: project.id,
        skill_id: 'taxonomy-1',
        confidence_score: 0.9,
        evidence_snippets: null,
        ai_reasoning: null,
        is_verified: false,
        created_at: '2024-01-01T00:00:00Z',
      };
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().addProjectSkill(skill);
      });
      expect(useProjectsStore.getState().currentProject?.extracted_skills).toHaveLength(1);
    });

    it('removes project skill', () => {
      const skill = {
        id: 'skill-1',
        project_id: 'project-1',
        skill_id: 'taxonomy-1',
        confidence_score: 0.9,
        evidence_snippets: null,
        ai_reasoning: null,
        is_verified: false,
        created_at: '2024-01-01T00:00:00Z',
        skill: {} as any,
      };
      const project = { ...createMockProjectWithArtifacts(), extracted_skills: [skill] };
      act(() => {
        useProjectsStore.getState().setCurrentProject(project);
        useProjectsStore.getState().removeProjectSkill('skill-1');
      });
      expect(useProjectsStore.getState().currentProject?.extracted_skills).toEqual([]);
    });
  });

  describe('state setters', () => {
    it('setLoading works', () => {
      act(() => {
        useProjectsStore.getState().setLoading(true);
      });
      expect(useProjectsStore.getState().isLoading).toBe(true);
    });

    it('setSaving works', () => {
      act(() => {
        useProjectsStore.getState().setSaving(true);
      });
      expect(useProjectsStore.getState().isSaving).toBe(true);
    });

    it('setError works', () => {
      act(() => {
        useProjectsStore.getState().setError('Test error');
      });
      expect(useProjectsStore.getState().error).toBe('Test error');
    });
  });

  describe('reset', () => {
    it('resets all state', () => {
      act(() => {
        useProjectsStore.getState().setProjects([createMockProject()]);
        useProjectsStore.getState().setCurrentProject(createMockProjectWithArtifacts());
        useProjectsStore.getState().setLoading(true);
        useProjectsStore.getState().setSaving(true);
        useProjectsStore.getState().setError('Error');
        useProjectsStore.getState().reset();
      });

      const state = useProjectsStore.getState();
      expect(state.projects).toEqual([]);
      expect(state.currentProject).toBeNull();
      expect(state.uploadProgress).toEqual({});
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});

// ============================================================================
// Selector hook tests
// ============================================================================
describe('useProjectById', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  it('returns undefined for non-existent id', () => {
    const { result } = renderHook(() => useProjectById('non-existent'));
    expect(result.current).toBeUndefined();
  });

  it('returns project for valid id', () => {
    const project = createMockProject({ id: 'project-1' });
    act(() => {
      useProjectsStore.getState().setProjects([project]);
    });
    const { result } = renderHook(() => useProjectById('project-1'));
    expect(result.current).toEqual(project);
  });

  it('returns undefined for undefined id', () => {
    const { result } = renderHook(() => useProjectById(undefined));
    expect(result.current).toBeUndefined();
  });
});

describe('usePublicProjects', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  it('returns only public projects', () => {
    const projects = [
      createMockProject({ id: 'p1', visibility: 'public' }),
      createMockProject({ id: 'p2', visibility: 'private' }),
      createMockProject({ id: 'p3', visibility: 'public' }),
    ];
    act(() => {
      useProjectsStore.getState().setProjects(projects);
    });
    const { result } = renderHook(() => usePublicProjects());
    expect(result.current).toHaveLength(2);
    expect(result.current.every((p) => p.visibility === 'public')).toBe(true);
  });
});

describe('useFeaturedProjects', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  it('returns only featured projects', () => {
    const projects = [
      createMockProject({ id: 'p1', is_featured: true }),
      createMockProject({ id: 'p2', is_featured: false }),
      createMockProject({ id: 'p3', is_featured: true }),
    ];
    act(() => {
      useProjectsStore.getState().setProjects(projects);
    });
    const { result } = renderHook(() => useFeaturedProjects());
    expect(result.current).toHaveLength(2);
    expect(result.current.every((p) => p.is_featured)).toBe(true);
  });
});

describe('useProjectsByType', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  it('returns projects of specified type', () => {
    const projects = [
      createMockProject({ id: 'p1', project_type: 'CODE' }),
      createMockProject({ id: 'p2', project_type: 'DOCUMENT' }),
      createMockProject({ id: 'p3', project_type: 'CODE' }),
    ];
    act(() => {
      useProjectsStore.getState().setProjects(projects);
    });
    const { result } = renderHook(() => useProjectsByType('CODE'));
    expect(result.current).toHaveLength(2);
    expect(result.current.every((p) => p.project_type === 'CODE')).toBe(true);
  });
});

describe('useActiveUploads', () => {
  beforeEach(() => {
    act(() => {
      useProjectsStore.getState().reset();
    });
  });

  it('returns only active uploads', () => {
    act(() => {
      useProjectsStore.getState().setUploadProgress('a1', {
        artifactId: 'a1',
        fileName: 'test1.ts',
        progress: 50,
        status: 'PROCESSING',
      });
      useProjectsStore.getState().setUploadProgress('a2', {
        artifactId: 'a2',
        fileName: 'test2.ts',
        progress: 100,
        status: 'COMPLETED',
      });
      useProjectsStore.getState().setUploadProgress('a3', {
        artifactId: 'a3',
        fileName: 'test3.ts',
        progress: 0,
        status: 'PENDING',
      });
    });
    const { result } = renderHook(() => useActiveUploads());
    expect(result.current).toHaveLength(2);
    expect(result.current.every((u) => u.status === 'PENDING' || u.status === 'PROCESSING')).toBe(true);
  });
});
