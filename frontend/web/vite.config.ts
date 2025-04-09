import { fileURLToPath, URL } from 'node:url' // Import URL utilities
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: {
      // Use import.meta.url for ESM compatibility
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Explicitly tell Vite to use PostCSS
  css: {
    postcss: './postcss.config.js',
  },
})
