import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './tests/mocks/server';

import { expect, vi } from 'vitest';

// globalThis에 IS_REACT_ACT_ENVIRONMENT 속성을 추가하기 위한 타입 선언
declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Next.js 이미지 컴포넌트 모킹
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation(({ src, alt }) => React.createElement('img', { src, alt })),
}));

// Next.js 라우터 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// React Query 모킹을 위한 글로벌 설정
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// 콘솔 모킹 (테스트에서 필요한 경우)
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// 공통 설정
beforeEach(() => {
  // @ts-ignore
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

// MSW 설정
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
