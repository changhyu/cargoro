/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom/vitest' {
  import { expect } from 'vitest';
  import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

  declare module 'vitest' {
    interface Assertion<T = unknown>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

// ReadableStream 관련 타입 확장
declare global {
  interface ReadableStream<R = unknown> {
    [Symbol.asyncIterator]?(): AsyncIterableIterator<R>;
  }
}
