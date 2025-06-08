import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // 고유한 프로젝트 이름 지정
    name: '@cargoro/ui-ts',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/disabled/**',
      '**/build/**',
      '**/.next/**',
    ],
    root: '.',
    // Jest 호환성 모드 추가
    includeSource: ['app/**/*.{js,ts,jsx,tsx}', 'components/**/*.{js,ts,jsx,tsx}'],
    // Jest DOM 호환성 확보
    deps: {
      optimizer: {
        web: {
          include: [
            '@testing-library/react',
            '@testing-library/user-event',
            '@radix-ui/react-use-is-hydrated',
            /^@radix-ui\/.*$/,
            'use-sync-external-store',
          ],
        },
      },
    },
    // Jest 스냅샷 호환성
    resolveSnapshotPath: (path, extension) => path + extension,
    // Act 경고 활성화
    testTransformMode: {
      web: ['jsx', 'tsx'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/tests/disabled/**',
        '**/build/**',
        '**/.next/**',
        '**/*.d.ts',
        '**/vitest.config.ts',
        '**/vitest.setup.ts',
        '**/coverage/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
  server: {
    deps: {
      inline: ['@radix-ui/react-use-is-hydrated', /^@radix-ui\/.*$/, 'use-sync-external-store'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@utils': resolve(__dirname, './utils'),
      utils: resolve(__dirname, './utils'),
      // 테스트 환경에서만 사용되는 모듈들 별칭 처리
      vitest: process.env.NODE_ENV === 'test' ? 'vitest' : resolve(__dirname, './mocks/empty.ts'),
      '@testing-library/react':
        process.env.NODE_ENV === 'test'
          ? '@testing-library/react'
          : resolve(__dirname, './mocks/empty.ts'),
      '@testing-library/user-event':
        process.env.NODE_ENV === 'test'
          ? '@testing-library/user-event'
          : resolve(__dirname, './mocks/empty.ts'),
      // use-sync-external-store 모듈 경로 문제 해결 (pnpm 경로 구조 적용)
      'use-sync-external-store/shim': resolve(
        __dirname,
        '../../node_modules/.pnpm/use-sync-external-store@1.2.0_react@18.2.0/node_modules/use-sync-external-store/shim/index.js'
      ),
      'use-sync-external-store/shim/with-selector': resolve(
        __dirname,
        '../../node_modules/.pnpm/use-sync-external-store@1.2.0_react@18.2.0/node_modules/use-sync-external-store/shim/with-selector.js'
      ),
    },
    conditions:
      process.env.NODE_ENV === 'test'
        ? ['import', 'module', 'node', 'default']
        : ['import', 'module', 'default'],
  },
  define: {
    'import.meta.vitest': process.env.NODE_ENV === 'test',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.IS_TEST': JSON.stringify(process.env.NODE_ENV === 'test'),
  },
});
