import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@radix-ui/*',
    'tailwindcss',
    'class-variance-authority',
    'clsx',
    'tailwind-merge',
  ],
  // onSuccess: 'npm run copy:css',
});
