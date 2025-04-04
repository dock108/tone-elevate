import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly tell Vite to use PostCSS
  css: {
    postcss: './postcss.config.js',
  },
})
