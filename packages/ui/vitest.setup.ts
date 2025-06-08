// 기본 테스트 설정
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll } from 'vitest';

// 타입 확장
interface CustomIntersectionObserver {
  callback: IntersectionObserverCallback;
  observe: () => void;
  unobserve: () => void;
  disconnect: () => void;
  trigger: (entries: IntersectionObserverEntry[]) => void;
}

// hasPointerCapture 관련 오류 해결을 위한 DOM 패치
beforeAll(() => {
  // Element.prototype에 hasPointerCapture가 없는 경우 추가
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = function () {
      return false;
    };
  }

  // scrollIntoView 메소드 추가
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = function () {
      return null;
    };
  }

  // 기타 필요한 DOM API 모킹
  if (!window.matchMedia) {
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
        dispatchEvent: vi.fn(() => true),
      })),
    });
  }

  // ResizeObserver 모킹
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  // IntersectionObserver 모킹
  global.IntersectionObserver = class MockIntersectionObserver
    implements CustomIntersectionObserver
  {
    callback: IntersectionObserverCallback;

    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    // 테스트에서 트리거 가능하도록 공개 메서드 추가
    trigger(entries: IntersectionObserverEntry[]) {
      this.callback(entries, this as unknown as IntersectionObserver);
    }
  } as unknown as typeof IntersectionObserver;

  // Radix UI 팝오버 관련 DOM 속성 모킹
  Object.defineProperties(HTMLElement.prototype, {
    getBoundingClientRect: {
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
      }),
      configurable: true,
    },
    offsetHeight: {
      get() {
        return 0;
      },
      configurable: true,
    },
    offsetWidth: {
      get() {
        return 0;
      },
      configurable: true,
    },
  });

  // dialog 관련 메소드 모킹
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {};
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {};
  }
});

// 각 테스트 후 자동 정리
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
