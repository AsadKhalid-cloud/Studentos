// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  base: './',
  build: {
    cssMinify: 'esbuild', // 👈 Fixes LightningCSS Tailwind v4 build error!
    emptyOutDir: false    // 👈 Fixes EBUSY file lock error!
  },
  server: {
    port: 5173
  }
});