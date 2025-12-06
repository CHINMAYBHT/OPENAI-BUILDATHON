import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      // Suppress warnings about Node.js built-ins
      onwarn(warning, warn) {
        // Ignore warnings about unresolved imports for Node.js built-ins
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            (warning.message.includes('util') || 
             warning.message.includes('stream') || 
             warning.message.includes('events') ||
             warning.message.includes('crypto') ||
             warning.message.includes('buffer'))) {
          return;
        }
        warn(warning);
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    exclude: [],
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
  },
})



