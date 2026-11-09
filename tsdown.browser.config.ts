import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { watchman: './src/browser/watchman.ts' },
  tsconfig: './tsconfig.browser.build.json',
  platform: 'browser',
  format: ['esm'],
  target: 'esnext',
  fixedExtension: false,
  dts: true,
  clean: false,
  outDir: 'dist',
  publint: true,
  attw: true,
});
