/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography'; // Import the plugin

export default {
  content: [
    "./index.html",
    "./src/App.tsx",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom colors based on the prompt
      colors: {
        'deep-blue': '#1E3A8A',       // Primary
        'teal-aqua': '#14B8A6',       // Accent
        'coral-accent': '#F87171',   // Accent for alerts/highlights
        'muted-purple': '#8B5CF6', // Accent for alerts/highlights
        // Add neutral shades if specific ones beyond default grays are needed
        // 'neutral-100': '#F9FAFB',
        // 'neutral-200': '#E5E7EB',
      },
      // Optionally define font families if not using Tailwind defaults
      fontFamily: {
        // Set Inter as the default sans font, including system fallbacks
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"],
      },
    },
  },
  plugins: [
    typography, // Add the typography plugin
  ],
} 