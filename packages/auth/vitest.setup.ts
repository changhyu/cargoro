// Vitest 설정 파일
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 글로벌 모킹
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// window 객체 모킹
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clerk 관련 전역 변수 모킹
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_publishable_key';
process.env.CLERK_SECRET_KEY = 'test_secret_key';
