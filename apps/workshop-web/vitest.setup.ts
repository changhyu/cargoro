import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

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
  const actual = await importOriginal<typeof import('@cargoro/ui')>();
  return {
    ...actual,
    useToast: () => ({
      toast: vi.fn(),
      dismiss: vi.fn(),
    }),
  };
});

// Clerk Mock 완전 설정 - useAuth export 문제 해결
vi.mock('@clerk/nextjs', async importOriginal => {
  const actual = await importOriginal<typeof import('@clerk/nextjs')>();

  const mockUseAuth = vi.fn(() => ({
    isSignedIn: true,
    userId: 'user-1',
    sessionId: 'session-1',
    orgId: 'org-1',
    orgRole: 'admin',
    signOut: vi.fn(),
    getToken: vi.fn().mockResolvedValue('mock-token'),
  }));

  const mockUseUser = vi.fn(() => ({
    user: {
      id: 'user-1',
      firstName: '테스트',
      lastName: '사용자',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
    },
    isLoaded: true,
    isSignedIn: true,
  }));

  const mockUseOrganization = vi.fn(() => ({
    organization: {
      id: 'org-1',
      name: '테스트 조직',
      slug: 'test-org',
    },
    isLoaded: true,
  }));

  return {
    ...actual,
    useAuth: mockUseAuth,
    useUser: mockUseUser,
    useOrganization: mockUseOrganization,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    SignInButton: ({ children }: { children: React.ReactNode }) => children,
    SignUpButton: ({ children }: { children: React.ReactNode }) => children,
    UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }, 'UserButton'),
    OrganizationSwitcher: () =>
      React.createElement('div', { 'data-testid': 'org-switcher' }, 'OrgSwitcher'),
  };
});

// React Query Mock 완전 설정
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    isError: false,
    isSuccess: true,
  })),
  useMutation: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn(),
    clear: vi.fn(),
  })),
  QueryClient: vi.fn().mockImplementation(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn(),
    clear: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// React Hook Form 모킹
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn: (data: unknown) => void) => fn),
    formState: { errors: {} },
    watch: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    reset: vi.fn(),
  }),
  Controller: ({
    render,
  }: {
    render: (props: {
      field: { onChange: () => void; value: string };
      fieldState: Record<string, unknown>;
    }) => React.ReactNode;
  }) =>
    render({
      field: { onChange: vi.fn(), value: '' },
      fieldState: {},
    }),
}));

// Zod Mock 완전 개선
vi.mock('zod', async importOriginal => {
  const actual = await importOriginal<typeof import('zod')>();

  const createMockZodChain = () => ({
    parse: vi.fn(),
    safeParse: vi.fn().mockReturnValue({ success: true, data: {} }),
    extend: vi.fn().mockReturnThis(),
    pick: vi.fn().mockReturnThis(),
    omit: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
    nullable: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    and: vi.fn().mockReturnThis(),
    transform: vi.fn().mockReturnThis(),
    refine: vi.fn().mockReturnThis(),
    superRefine: vi.fn().mockReturnThis(),
    default: vi.fn().mockReturnThis(),
    min: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    length: vi.fn().mockReturnThis(),
    email: vi.fn().mockReturnThis(),
    url: vi.fn().mockReturnThis(),
    regex: vi.fn().mockReturnThis(),
    int: vi.fn().mockReturnThis(),
    positive: vi.fn().mockReturnThis(),
    negative: vi.fn().mockReturnThis(),
    nonpositive: vi.fn().mockReturnThis(),
    nonnegative: vi.fn().mockReturnThis(),
    multipleOf: vi.fn().mockReturnThis(),
    finite: vi.fn().mockReturnThis(),
    safe: vi.fn().mockReturnThis(),
  });

  return {
    ...actual,
    z: {
      ...actual.z,
      object: vi.fn().mockReturnValue(createMockZodChain()),
      string: vi.fn().mockReturnValue(createMockZodChain()),
      number: vi.fn().mockReturnValue(createMockZodChain()),
      boolean: vi.fn().mockReturnValue(createMockZodChain()),
      date: vi.fn().mockReturnValue(createMockZodChain()),
      array: vi.fn().mockReturnValue(createMockZodChain()),
      enum: vi.fn().mockReturnValue(createMockZodChain()),
      union: vi.fn().mockReturnValue(createMockZodChain()),
      literal: vi.fn().mockReturnValue(createMockZodChain()),
      undefined: vi.fn().mockReturnValue(createMockZodChain()),
      null: vi.fn().mockReturnValue(createMockZodChain()),
      void: vi.fn().mockReturnValue(createMockZodChain()),
      any: vi.fn().mockReturnValue(createMockZodChain()),
      unknown: vi.fn().mockReturnValue(createMockZodChain()),
      never: vi.fn().mockReturnValue(createMockZodChain()),
      coerce: {
        string: vi.fn().mockReturnValue(createMockZodChain()),
        number: vi.fn().mockReturnValue(createMockZodChain()),
        boolean: vi.fn().mockReturnValue(createMockZodChain()),
        date: vi.fn().mockReturnValue(createMockZodChain()),
      },
    },
  };
});

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
  const actual = await importOriginal<any>();
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

// 브라우저 API 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
