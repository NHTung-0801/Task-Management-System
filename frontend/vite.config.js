import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ============================================
// Cấu hình Vite
// - Port 5173 (mặc định)
// - Proxy /api → backend:8080 (tránh lỗi CORS khi phát triển)
// ============================================
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
