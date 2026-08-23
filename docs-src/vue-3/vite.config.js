import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@stackline/vue-google-maps': resolve(import.meta.dirname, '../../src/index.ts'),
      '@docs-meta': resolve(import.meta.dirname, './src/docs-meta.ts'),
      vue: resolve(import.meta.dirname, 'node_modules/vue/dist/vue.esm-bundler.js')
    },
    dedupe: ['vue']
  },
  build: {
    outDir: '../../docs/vue-3',
    emptyOutDir: true
  }
});
