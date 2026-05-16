import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise warning threshold slightly — pages are feature-rich
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor libs into separate cacheable chunks.
        // React/ReactDOM rarely change → browser cache hit on re-deploys.
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-axios': ['axios'],
        },
      },
    },
  },
});
