import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    typecheck: {
      tsconfig: path.resolve(__dirname, 'tsconfig.test.json'),
    },
  },
  resolve: {
    alias: {
      '@': '/app',
    },
  },
});
