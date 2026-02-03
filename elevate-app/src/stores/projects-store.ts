import { create } from 'zustand';
import type {
  Project,
  ProjectArtifact,
  ProjectSkill,
  ProjectWithArtifacts,
  UploadStatus,
} from '@/lib/supabase/types';

interface UploadProgress {
  artifactId: string;
  fileName: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface ProjectsState {
  // State
  projects: Project[];
  currentProject: ProjectWithArtifacts | null;
  uploadProgress: Record<string, UploadProgress>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Project actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: ProjectWithArtifacts | null) => void;

  // Artifact actions
  addArtifact: (artifact: ProjectArtifact) => void;
  updateArtifact: (artifactId: string, updates: Partial<ProjectArtifact>) => void;
  deleteArtifact: (artifactId: string) => void;

  // Upload tracking
  setUploadProgress: (artifactId: string, progress: UploadProgress) => void;
  clearUploadProgress: (artifactId: string) => void;
  clearAllUploads: () => void;

  // Skills actions
  addProjectSkill: (skill: ProjectSkill) => void;
  removeProjectSkill: (skillId: string) => void;

  // State setters
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  projects: [],
  currentProject: null,
  uploadProgress: {},
  isLoading: false,
  isSaving: false,
  error: null,
};

export const useProjectsStore = create<ProjectsState>()((set, get) => ({
  ...initialState,

  // Project actions
  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),

  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),

  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProject:
        state.currentProject?.id === projectId ? null : state.currentProject,
    })),

  setCurrentProject: (project) => set({ currentProject: project }),

  // Artifact actions
  addArtifact: (artifact) =>
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          artifacts: [...state.currentProject.artifacts, artifact],
        },
      };
    }),

  updateArtifact: (artifactId, updates) =>
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          artifacts: state.currentProject.artifacts.map((a) =>
            a.id === artifactId ? { ...a, ...updates } : a
          ),
        },
      };
    }),

  deleteArtifact: (artifactId) =>
    set((state) => {
      if (!state.currentProject) return state;
      return {
        currentProject: {
          ...state.currentProject,
          artifacts: state.currentProject.artifacts.filter(
            (a) => a.id !== artifactId
          ),
        },
      };
    }),

  // Upload tracking
  setUploadProgress: (artifactId, progress) =>
    set((state) => ({
      uploadProgress: {
        ...state.uploadProgress,
        [artifactId]: progress,
      },
    })),

  clearUploadProgress: (artifactId) =>
    set((state) => {
      const { [artifactId]: _, ...rest } = state.uploadProgress;
      return { uploadProgress: rest };
    }),

  clearAllUploads: () => set({ uploadProgress: {} }),

  // Skills actions
  addProjectSkill: (skill) =>
    set((state) => {
      if (!state.currentProject) return state;
      const existingSkills = state.currentProject.extracted_skills || [];
      return {
        currentProject: {
          ...state.currentProject,
          extracted_skills: [...existingSkills, { ...skill, skill: {} as any }],
        },
      };
    }),

  removeProjectSkill: (skillId) =>
    set((state) => {
      if (!state.currentProject?.extracted_skills) return state;
      return {
        currentProject: {
          ...state.currentProject,
          extracted_skills: state.currentProject.extracted_skills.filter(
            (s) => s.id !== skillId
          ),
        },
      };
    }),

  // State setters
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

// Derived selectors
export function useProjectById(projectId: string | undefined) {
  return useProjectsStore((state) =>
    state.projects.find((p) => p.id === projectId)
  );
}

export function usePublicProjects() {
  return useProjectsStore((state) =>
    state.projects.filter((p) => p.visibility === 'public')
  );
}

export function useFeaturedProjects() {
  return useProjectsStore((state) =>
    state.projects.filter((p) => p.is_featured)
  );
}

export function useProjectsByType(type: Project['project_type']) {
  return useProjectsStore((state) =>
    state.projects.filter((p) => p.project_type === type)
  );
}

export function useActiveUploads() {
  return useProjectsStore((state) =>
    Object.values(state.uploadProgress).filter(
      (u) => u.status === 'PENDING' || u.status === 'PROCESSING'
    )
  );
}
