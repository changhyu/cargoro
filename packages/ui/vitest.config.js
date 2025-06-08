import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@utils': resolve(__dirname, './utils'),
      utils: resolve(__dirname, './utils'),
    },
  },
  test: {
    // 고유한 프로젝트 이름 지정
    name: '@cargoro/ui-js',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.turbo', 'dist', '.next', '.git', '**/*.d.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: ['**/node_modules/**', '**/tests/**', '**/*.d.ts', '**/*.config.js', '**/dist/**'],
    },
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
  // deprecated 옵션들을 server 섹션으로 이동
  server: {
    deps: {
      inline: [
        '@testing-library/user-event',
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@radix-ui/react-select',
        '@radix-ui/react-dialog',
        '@radix-ui/react-popover',
      ],
      fallbackCJS: true,
    },
  },
});
