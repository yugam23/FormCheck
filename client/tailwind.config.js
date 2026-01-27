/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0F172A', // Deep Slate
        base: '#020617',    // Almost Black
        primary: {
          DEFAULT: '#10B981', // Emerald Green
          hover: '#34D399',
        },
        alert: '#EF4444',   // Vibrant Red
        accent: '#8B5CF6',  // Electric Violet
        border: '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
}
