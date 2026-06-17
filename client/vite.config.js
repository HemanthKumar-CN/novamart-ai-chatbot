import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // In dev, proxy API calls to backend so the browser sees same-origin.
      // Server default PORT is 5050 (see server/src/config/env.js).
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
