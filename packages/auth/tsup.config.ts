import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'server.ts', 'web.ts'],
  format: ['cjs', 'esm'],
  dts: {
    only: false,
    resolve: true,
    entry: ['index.ts', 'server.ts', 'web.ts'],
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-native',
    '@clerk/nextjs',
    '@clerk/nextjs/server',
    '@clerk/clerk-expo',
    'next',
    'swr',
    '@react-native-async-storage/async-storage',
    'expo-router',
    'svix',
  ],
});
