import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Avoid default 5173 — often taken by other Vite apps on a laptop.
    port: 5180,
    strictPort: true,
  },
  // Keep workspace TS source out of dep prebundle so HMR sees shared changes.
  optimizeDeps: {
    exclude: ['@tvshell/shared', '@tvshell/surface-stub'],
  },
});
