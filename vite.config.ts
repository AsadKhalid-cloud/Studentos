import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // CRITICAL FOR ELECTRON DESKTOP FILE:// PROTOCOL
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.10.180:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});