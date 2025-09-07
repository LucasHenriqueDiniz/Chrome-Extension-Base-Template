import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'popup/index.html': resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background.ts'),
        'content-list': resolve(__dirname, 'src/content-list.ts'),
        'content-view': resolve(__dirname, 'src/content-view.ts')
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'popup/index.html') return 'popup/main.js';
          return '[name].js';
        },
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  }
});
