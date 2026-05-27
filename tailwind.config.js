/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Tema oscuro base (default del MVP)
        bg: {
          DEFAULT: '#0a0a0a',
          elevated: '#161616',
          subtle: '#1f1f1f',
        },
        fg: {
          DEFAULT: '#fafafa',
          muted: '#a1a1a1',
          subtle: '#525252',
        },
        accent: {
          DEFAULT: '#10b981', // verde para confirmaciones / PRs
          muted: '#064e3b',
        },
        warn: {
          DEFAULT: '#f59e0b',
          muted: '#451a03',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
