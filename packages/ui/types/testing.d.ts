/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

// Vitest와 Jest-DOM 타입 호환성을 위한 타입 확장
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Vitest의 Assertion 인터페이스를 확장
declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}

// 글로벌 객체에 확장
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends TestingLibraryMatchers<T, void> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
  }
}
