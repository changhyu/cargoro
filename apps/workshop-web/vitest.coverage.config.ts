import { defineConfig, mergeConfig } from 'vitest/config';
import vitestConfig from './vitest.config';

export default mergeConfig(
  vitestConfig as any,
  defineConfig({
    test: {
      // 고유한 프로젝트 이름 지정
      name: '@cargoro/workshop-web-coverage',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: './coverage',
        include: ['app/**/*.{ts,tsx}'],
        exclude: [
          'app/**/*.d.ts',
          'app/**/*.stories.{ts,tsx}',
          'app/**/*{.,-}test.{ts,tsx}',
          'app/**/mocks/**',
          'app/**/types.{ts,tsx}',
          'app/**/constants.{ts,tsx}',
          'app/**/index.{ts,tsx}',
        ],
        all: true,
        thresholds: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
        // perFile: true, - v8 provider에서 지원하지 않는 옵션
        reportOnFailure: true,
      },
    },
  })
);
