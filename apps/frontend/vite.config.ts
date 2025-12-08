import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resolve-ts-extensions',
      enforce: 'pre',
      resolveId(id, importer) {
        // Only handle imports from @sinav/shared
        if (importer && importer.includes('packages/shared')) {
          // If importing without extension, try .ts first
          if (!id.includes('.') && !id.startsWith('@')) {
            const dir = path.dirname(importer);
            const tsPath = path.join(dir, `${id}.ts`);
            if (fs.existsSync(tsPath)) {
              return tsPath;
            }
          }
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@sinav/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts', '.json'],
  },
  optimizeDeps: {
    include: ['@sinav/shared'],
    esbuildOptions: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:*; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https: moz-extension: chrome-extension:;",
    },
  },
});

