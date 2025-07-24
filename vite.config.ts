import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Configurações otimizadas para Docker
  server: {
    host: '0.0.0.0', // Necessário para Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker/Windows
    },
  },

  // Configurações de build
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          http: ['axios', '@tanstack/react-query'],
        },
      },
    },
  },

  // Preview server (para testar build localmente)
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
});
