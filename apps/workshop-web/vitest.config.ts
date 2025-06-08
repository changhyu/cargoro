import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Fleet Manager Web의 성공 패턴을 적용한 단순화된 설정
export default defineConfig({
  plugins: [react() as any],
  test: {
    // 고유한 프로젝트 이름 지정
    name: '@cargoro/workshop-web',
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
      '@': path.resolve(__dirname, './'),
      '@app': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './app/components'),
      '@features': path.resolve(__dirname, './app/features'),
      '@hooks': path.resolve(__dirname, './app/hooks'),
      '@state': path.resolve(__dirname, './app/state'),
      '@services': path.resolve(__dirname, './app/services'),
      '@constants': path.resolve(__dirname, './app/constants'),
      // 워크스페이스 패키지 alias 추가
      '@cargoro/utils': path.resolve(__dirname, '../../packages/utils'),
      '@cargoro/api-client': path.resolve(__dirname, '../../packages/api-client'),
      '@cargoro/types': path.resolve(__dirname, '../../packages/types'),
      '@cargoro/auth': path.resolve(__dirname, '../../packages/auth'),
      // UI 모킹
      '@cargoro/ui/hooks': path.resolve(__dirname, './__mocks__/ui/hooks'),
      '@cargoro/ui/hooks/use-toast': path.resolve(__dirname, './__mocks__/ui/hooks/use-toast'),
    },
  },
  // 최신 권장 방식으로 설정
});
