import { vi } from 'vitest';

// Router mock
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn().mockResolvedValue(undefined),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

// Pathname mock - can be overridden in individual tests
let currentPathname = '/';
export const setMockPathname = (pathname: string) => {
  currentPathname = pathname;
};

// Search params mock
let currentSearchParams = new URLSearchParams();
export const setMockSearchParams = (params: Record<string, string> | URLSearchParams) => {
  currentSearchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
};

// Params mock
let currentParams: Record<string, string | string[]> = {};
export const setMockParams = (params: Record<string, string | string[]>) => {
  currentParams = params;
};

// Export hooks
export const useRouter = () => mockRouter;
export const usePathname = () => currentPathname;
export const useSearchParams = () => currentSearchParams;
export const useParams = () => currentParams;

// Server-side functions
export const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT: ${url}`);
});

export const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

export const permanentRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_PERMANENT_REDIRECT: ${url}`);
});

// Reset all navigation mocks
export function resetNavigationMocks() {
  mockRouter.push.mockClear();
  mockRouter.replace.mockClear();
  mockRouter.prefetch.mockClear();
  mockRouter.back.mockClear();
  mockRouter.forward.mockClear();
  mockRouter.refresh.mockClear();
  redirect.mockClear();
  notFound.mockClear();
  permanentRedirect.mockClear();
  currentPathname = '/';
  currentSearchParams = new URLSearchParams();
  currentParams = {};
}

// Navigation event mock
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [];

// Server actions
export const revalidatePath = vi.fn();
export const revalidateTag = vi.fn();

// Headers mock (for server components)
export const headers = vi.fn(() => new Headers());
export const cookies = vi.fn(() => ({
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
  getAll: vi.fn(() => []),
}));

// Default export for mock module
export default {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  redirect,
  notFound,
  permanentRedirect,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
};
