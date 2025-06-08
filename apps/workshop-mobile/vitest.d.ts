/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import 'vitest';

declare module 'vitest' {
  interface Assertion<T = unknown> extends jest.Matchers<void, T> {}
  interface AsymmetricMatchersContaining extends jest.AsymmetricMatchers {}
}

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {}
  }
}
