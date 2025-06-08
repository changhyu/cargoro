/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 웹 앱용 Vitest 설정을 앱 내부에서 직접 정의
export default defineConfig({
  plugins: [react()],
  test: {
    // 고유한 프로젝트 이름 지정
    name: '@cargoro/fleet-manager-web',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['./app/**/*.{test,spec}.{ts,tsx}', './tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**', '**/coverage/**'],
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
    },
  },
  // 최신 권장 방식으로 설정
  server: {
    deps: {
      inline: true,
      fallbackCJS: true,
    },
  },
});
