import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Next.js 관련 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Toast Provider 모킹 추가
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: ({ children }: { children?: React.ReactNode }) => children || null,
}));

// useToast 훅 모킹 (UI 라이브러리에서 제공하는 경우)
vi.mock('@cargoro/ui', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useToast: () => ({
      toast: vi.fn(),
      dismiss: vi.fn(),
    }),
  };
});

// Clerk 인증 모킹
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn().mockReturnValue({ userId: null }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
    userId: null,
  }),
  useUser: () => ({
    isLoaded: true,
    isSignedIn: false,
    user: null,
  }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
  UserButton: () => null,
}));

// React Query 모킹
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  }),
  QueryClient: vi.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// 리차트 모킹 (차트 라이브러리)
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  BarChart: () => null,
  Bar: () => null,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
}));

// GraphQL 클라이언트 모킹
vi.mock('@cargoro/api-client', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const mockGraphQLClient = {
    query: vi.fn().mockResolvedValue({}),
    mutate: vi.fn().mockResolvedValue({}),
    setAuthToken: vi.fn(),
  };

  return {
    ...actual,
    configureGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
    getGraphQLClient: vi.fn().mockReturnValue(mockGraphQLClient),
  };
});

// 전역 객체 모킹
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 테스트 환경 설정
beforeAll(() => {
  // 테스트 시작 전 설정
});

afterAll(() => {
  // 테스트 종료 후 정리
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// 콘솔 에러 억제
console.error = vi.fn();
console.warn = vi.fn();
