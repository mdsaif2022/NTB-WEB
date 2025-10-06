import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify('v16.0.0'),
  },
  optimizeDeps: {
    include: ['cloudinary']
  }
});
