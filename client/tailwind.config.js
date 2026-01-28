/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0F172A', // Deep Slate
        base: '#020617', // Almost Black
        primary: {
          DEFAULT: '#10B981', // Emerald Green
          hover: '#34D399',
          glow: 'rgba(16, 185, 129, 0.5)',
        },
        alert: {
          DEFAULT: '#EF4444', // Vibrant Red
          glow: 'rgba(239, 68, 68, 0.5)',
        },
        accent: {
          DEFAULT: '#8B5CF6', // Electric Violet
          glow: 'rgba(139, 92, 246, 0.5)',
        },
        border: '#334155',
        muted: '#475569',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        full: '9999px',
      },
      boxShadow: {
        'glow-primary': '0 0 10px rgba(16, 185, 129, 0.5)',
        'glow-alert': '0 0 10px rgba(239, 68, 68, 0.5)',
        'glow-accent': '0 0 10px rgba(139, 92, 246, 0.5)',
      },
    },
  },
  plugins: [],
};
