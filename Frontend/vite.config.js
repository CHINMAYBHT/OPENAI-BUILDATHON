import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Prevent Node.js built-in modules from being bundled in browser
      // These are not needed in browser environment
      util: 'util/',
      stream: 'stream-browserify',
      events: 'events/',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    exclude: [],
    include: ['@supabase/supabase-js'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    // Polyfill global for browser
    global: 'globalThis',
    'process.env': {},
  },
})


