import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// jest-dom matchers 확장
expect.extend(matchers);

// 각 테스트 후 정리
afterEach(() => {
  // 모든 모킹 초기화
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

// 전역 모킹 설정
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  })),
}));

// 환경 변수 모킹
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://localhost:3000',
  NEXT_PUBLIC_GRAPHQL_URL: 'http://localhost:3000/graphql',
};

// console 경고 억제 (테스트 시)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('componentWillReceiveProps')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
