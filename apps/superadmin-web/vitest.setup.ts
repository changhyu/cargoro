import { vi } from 'vitest';
import React from 'react';
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './tests/mocks/server';
import { expect } from 'vitest';

// Clerk 모킹
vi.mock('@clerk/nextjs', () => ({
  auth: vi.fn(() => ({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    orgId: null,
  })),
  useAuth: vi.fn(() => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  })),
  useUser: vi.fn(() => ({
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com', id: 'email-1' }],
      publicMetadata: {
        role: 'super_admin',
        permissions: ['users:read', 'users:write', 'users:delete'],
      },
    },
    isLoaded: true,
  })),
  useClerk: vi.fn(() => ({
    signOut: vi.fn(),
  })),
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: ({ children }: { children: React.ReactNode }) => null,
  UserButton: () => null,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Next.js 이미지 컴포넌트 모킹
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation(({ src, alt }) => React.createElement('img', { src, alt })),
}));

// Next.js Router 모킹
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => ({
    get: vi.fn(),
  })),
  notFound: vi.fn(),
}));

// 인증 서비스 모킹
vi.mock('@/app/services/clerk', () => ({
  getAllUsers: vi.fn(() => Promise.resolve([])),
  getUserById: vi.fn(() =>
    Promise.resolve({
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com', id: 'email-1' }],
      publicMetadata: {
        role: 'super_admin',
        permissions: ['users:read', 'users:write', 'users:delete'],
      },
    })
  ),
  createUser: vi.fn(() => Promise.resolve({ id: 'new-user-id' })),
  updateUser: vi.fn(() => Promise.resolve({ id: 'updated-user-id' })),
  deleteUser: vi.fn(() => Promise.resolve(true)),
  toggleUserActive: vi.fn(() => Promise.resolve(true)),
  getUserPermissions: vi.fn(() => Promise.resolve(['users:read', 'users:write'])),
  updateUserPermissions: vi.fn(() => Promise.resolve(true)),
}));

// 인증 유틸리티 모킹
vi.mock('@/app/utils/auth', () => ({
  getCurrentUserPermissions: vi.fn(() =>
    Promise.resolve(['users:read', 'users:write', 'users:delete'])
  ),
  hasPermission: vi.fn(() => Promise.resolve(true)),
  hasPermissions: vi.fn(() => Promise.resolve(true)),
  hasAnyPermission: vi.fn(() => Promise.resolve(true)),
  hasAllPermissions: vi.fn(() => Promise.resolve(true)),
  checkCurrentUserPermission: vi.fn(() => Promise.resolve(true)),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// matchMedia 모킹
beforeEach(() => {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };
});

// 각 테스트 전에 모든 모킹 초기화
beforeEach(() => {
  vi.clearAllMocks();
});

// MSW 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// 전역 타입 확장
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}

// 환경 변수 설정
// NODE_ENV는 이미 test로 설정되어 있음
// process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test-key';
process.env.CLERK_SECRET_KEY = 'test-secret';
