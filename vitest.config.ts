import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/coverage/**',
      'tests/unit/browser/**',
      'tests/unit/*browser*.{test,spec}.{js,jsx,ts,tsx}',
    ],

    setupFiles: ['./tests/setup.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'clover'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'node_modules/',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/mock',
        'coverage/**',
        // 브라우저 전용 파일은 브라우저 환경에서 테스트
        'src/utils/browser-url.ts',
      ],
      all: true,
      clean: true,
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
