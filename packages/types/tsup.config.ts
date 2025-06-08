import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Disable DTS for now to avoid build issues
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
