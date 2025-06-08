import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 스마트카 앱용 Vitest 설정을 앱 내부에서 직접 정의
export default defineConfig({
  plugins: [react()],
  test: {
    // 고유한 프로젝트 이름 지정
    name: '@cargoro/smart-car-assistant',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['./app/**/*.{test,spec}.{ts,tsx}', './tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/coverage/**'],
    // 최신 권장 방식으로 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'app/constants',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/coverage/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './app/components'),
      '@features': path.resolve(__dirname, './app/features'),
      '@hooks': path.resolve(__dirname, './app/hooks'),
      '@state': path.resolve(__dirname, './app/state'),
      '@services': path.resolve(__dirname, './app/services'),
      '@constants': path.resolve(__dirname, './app/constants'),
      '@cargoro/ui': path.resolve(__dirname, '../../packages/ui/app/index'),
      '@cargoro/utils': path.resolve(__dirname, '../../packages/utils/app/index'),
      '@cargoro/types': path.resolve(__dirname, '../../packages/types/app/index'),
      '@cargoro/api-client': path.resolve(__dirname, '../../packages/api-client/app/index'),
      '@cargoro/auth': path.resolve(__dirname, '../../packages/auth/app/index'),
      '@cargoro/analytics': path.resolve(__dirname, '../../packages/analytics/app/index'),
      '@cargoro/i18n': path.resolve(__dirname, '../../packages/i18n/app/index'),
    },
  },
});
