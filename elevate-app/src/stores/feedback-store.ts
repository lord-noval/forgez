import { create } from 'zustand';
import type {
  FeedbackRequest,
  FeedbackRespondent,
  FeedbackResponse,
  FeedbackStatus,
  FeedbackRequestWithRespondents,
  FeedbackRespondentWithResponse,
} from '@/lib/supabase/types';

interface FeedbackState {
  // State
  requests: FeedbackRequestWithRespondents[];
  currentRequest: FeedbackRequestWithRespondents | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Request actions
  setRequests: (requests: FeedbackRequestWithRespondents[]) => void;
  addRequest: (request: FeedbackRequestWithRespondents) => void;
  updateRequest: (requestId: string, updates: Partial<FeedbackRequest>) => void;
  deleteRequest: (requestId: string) => void;
  setCurrentRequest: (request: FeedbackRequestWithRespondents | null) => void;

  // Respondent actions
  updateRespondentStatus: (respondentId: string, status: FeedbackStatus) => void;
  addResponse: (respondentId: string, response: FeedbackResponse) => void;

  // State setters
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  requests: [],
  currentRequest: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

export const useFeedbackStore = create<FeedbackState>()((set) => ({
  ...initialState,

  // Request actions
  setRequests: (requests) => set({ requests }),

  addRequest: (request) =>
    set((state) => ({
      requests: [request, ...state.requests],
    })),

  updateRequest: (requestId, updates) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, ...updates } : r
      ),
      currentRequest:
        state.currentRequest?.id === requestId
          ? { ...state.currentRequest, ...updates }
          : state.currentRequest,
    })),

  deleteRequest: (requestId) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== requestId),
      currentRequest:
        state.currentRequest?.id === requestId ? null : state.currentRequest,
    })),

  setCurrentRequest: (request) => set({ currentRequest: request }),

  // Respondent actions
  updateRespondentStatus: (respondentId, status) =>
    set((state) => {
      if (!state.currentRequest) return state;

      const updatedRespondents = state.currentRequest.respondents.map((resp) =>
        resp.id === respondentId
          ? { ...resp, status, responded_at: status === 'COMPLETED' ? new Date().toISOString() : resp.responded_at }
          : resp
      );

      return {
        currentRequest: {
          ...state.currentRequest,
          respondents: updatedRespondents,
        },
      };
    }),

  addResponse: (respondentId, response) =>
    set((state) => {
      if (!state.currentRequest) return state;

      const updatedRespondents = state.currentRequest.respondents.map((resp) =>
        resp.id === respondentId
          ? {
              ...resp,
              responses: [...(resp.responses || []), response],
              status: 'COMPLETED' as FeedbackStatus,
              responded_at: new Date().toISOString(),
            }
          : resp
      );

      return {
        currentRequest: {
          ...state.currentRequest,
          respondents: updatedRespondents,
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
export function useRequestsByStatus(status: FeedbackStatus) {
  return useFeedbackStore((state) =>
    state.requests.filter((r) => r.status === status)
  );
}

export function usePendingRequests() {
  return useFeedbackStore((state) =>
    state.requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS')
  );
}

export function useCompletedRequests() {
  return useFeedbackStore((state) =>
    state.requests.filter((r) => r.status === 'COMPLETED')
  );
}

export function useFeedbackStats() {
  return useFeedbackStore((state) => {
    const total = state.requests.length;
    const pending = state.requests.filter((r) => r.status === 'PENDING').length;
    const inProgress = state.requests.filter((r) => r.status === 'IN_PROGRESS').length;
    const completed = state.requests.filter((r) => r.status === 'COMPLETED').length;
    const expired = state.requests.filter((r) =>
      r.status === 'EXPIRED' || new Date(r.expires_at) < new Date()
    ).length;

    const totalRespondents = state.requests.reduce(
      (sum, r) => sum + (r.respondents?.length || 0),
      0
    );
    const completedResponses = state.requests.reduce(
      (sum, r) =>
        sum + (r.respondents?.filter((resp) => resp.status === 'COMPLETED').length || 0),
      0
    );

    return {
      total,
      pending,
      inProgress,
      completed,
      expired,
      totalRespondents,
      completedResponses,
      responseRate: totalRespondents > 0
        ? Math.round((completedResponses / totalRespondents) * 100)
        : 0,
    };
  });
}

export function useRequestById(requestId: string | undefined) {
  return useFeedbackStore((state) =>
    state.requests.find((r) => r.id === requestId)
  );
}
