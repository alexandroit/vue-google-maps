import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue2 from '@vitejs/plugin-vue2';

export default defineConfig({
  plugins: [vue2()],
  base: './',
  resolve: {
    alias: {
      '@stackline/vue-google-maps': resolve(import.meta.dirname, '../../src/index.ts'),
      '@docs-meta': resolve(import.meta.dirname, './src/docs-meta.js'),
      vue: resolve(import.meta.dirname, 'node_modules/vue/dist/vue.esm.js')
    },
    dedupe: ['vue']
  },
  build: {
    outDir: '../../docs/vue-2',
    emptyOutDir: true
  }
});
