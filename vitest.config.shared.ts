import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export const sharedConfig = defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/mock',
        '**/*.stories.tsx',
        '**/generated/**',
        '.next/**',
        'coverage/**',
        'dist/**',
        'build/**',
        '.turbo/**',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    // 테스트 실행 최적화
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // 타임아웃 설정
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@cargoro/ui': resolve(__dirname, './packages/ui/src'),
      '@cargoro/auth': resolve(__dirname, './packages/auth/src'),
      '@cargoro/api-client': resolve(__dirname, './packages/api-client/src'),
      '@cargoro/types': resolve(__dirname, './packages/types/src'),
      '@cargoro/utils': resolve(__dirname, './packages/utils/src'),
      '@cargoro/analytics': resolve(__dirname, './packages/analytics/src'),
      '@cargoro/i18n': resolve(__dirname, './packages/i18n/src'),
      '@cargoro/gps-obd-lib': resolve(__dirname, './packages/gps-obd-lib/src'),
    },
  },
});

// React 프로젝트용 공통 설정
export const reactConfig = defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.react.ts'],
    // React Testing Library 최적화
    globals: true,
    css: true,
    // MSW 모킹 지원
    server: {
      deps: {
        inline: ['@cargoro/ui', '@cargoro/auth'],
      },
    },
  },
});

// Node.js/백엔드 프로젝트용 공통 설정
export const nodeConfig = defineConfig({
  ...sharedConfig,
  test: {
    ...sharedConfig.test,
    environment: 'node',
    setupFiles: ['./tests/setup.node.ts'],
    deps: {
      optimizer: {
        web: {
          include: [],
        },
        ssr: {
          include: [],
        },
      },
    },
  },
});
