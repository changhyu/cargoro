import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'tests/unit/browser/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/unit/*browser*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/coverage/**',
    ],
    setupFiles: ['./tests/setup.browser.ts'],
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
      ],
      all: true,
      clean: true,
      reportsDirectory: './coverage-browser',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
