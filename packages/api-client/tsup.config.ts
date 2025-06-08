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
    'react-native',
    '@tanstack/react-query',
    '@clerk/nextjs',
    'next',
    'axios',
    'graphql',
    'graphql-request',
  ],
});
