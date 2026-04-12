import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point to shared root so that '@smart-expense/shared/src/...' works
      '@smart-expense/shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    port: 3000,
    // Proxy API calls to the Spring Boot backend to avoid CORS issues in dev
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
