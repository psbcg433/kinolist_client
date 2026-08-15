import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('/redux/')) {
            return 'state-vendor';
          }
          if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
});
