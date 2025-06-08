/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom' {
  export * from '@testing-library/jest-dom/types/jest-dom';
}

// testing-library__jest-dom 타입 정의
declare module 'testing-library__jest-dom' {
  export * from '@testing-library/jest-dom';
}

/**
 * vitest/globals 타입 정의
 * 전역 테스트 함수들에 대한 타입 정의를 제공합니다.
 */

declare module 'vitest/globals' {
  // vitest의 전역 테스트 함수들
  export const describe: (typeof import('vitest'))['describe'];
  export const it: (typeof import('vitest'))['it'];
  export const test: (typeof import('vitest'))['test'];
  export const expect: (typeof import('vitest'))['expect'];
  export const vi: (typeof import('vitest'))['vi'];
  export const beforeAll: (typeof import('vitest'))['beforeAll'];
  export const afterAll: (typeof import('vitest'))['afterAll'];
  export const beforeEach: (typeof import('vitest'))['beforeEach'];
  export const afterEach: (typeof import('vitest'))['afterEach'];

  // 추가 함수들
  export const suite: (typeof import('vitest'))['suite'];
  export const bench: (typeof import('vitest'))['bench'];
}

// Vitest globals
declare global {
  var describe: typeof import('vitest').describe;
  var it: typeof import('vitest').it;
  var test: typeof import('vitest').test;
  var expect: typeof import('vitest').expect;
  var beforeAll: typeof import('vitest').beforeAll;
  var afterAll: typeof import('vitest').afterAll;
  var beforeEach: typeof import('vitest').beforeEach;
  var afterEach: typeof import('vitest').afterEach;
  var vi: typeof import('vitest').vi;
}

// jest-dom 매처 확장
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining extends jest.Matchers<any> {}
  }
}
