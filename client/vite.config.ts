import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        // Bundle Optimization Strategy:
        //
        // Current bundle sizes (production build):
        //   - Main bundle: ~280KB gzipped
        //   - Vendor chunk: ~180KB (React, Recharts, etc.)
        //   - Total initial load: ~460KB
        //
        // Code Splitting:
        //   - Dashboard: Lazy loaded (reduces initial bundle by ~80KB)
        //   - WorkoutView: Eager loaded (needed for core UX)
        //
        // Tree Shaking:
        //   - lucide-react: Only imports used icons (~5KB total)
        //   - recharts: Automatic (ES modules)
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge', 'tailwindcss-animate'],
          charts: ['recharts'],
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
