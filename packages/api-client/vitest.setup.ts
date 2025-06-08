import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// 각 테스트 후 자동 정리
afterEach(() => {
  cleanup();
});
