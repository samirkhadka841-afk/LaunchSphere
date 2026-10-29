/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05070f', 900: '#080c1a', 800: '#0c1226', 700: '#111a36', 600: '#1a2547' },
        electric: { 400: '#5b8cff', 500: '#3b74ff', 600: '#2a5ce6' },
        violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: { glow: '0 0 40px -10px rgba(91,140,255,0.45)' },
    },
  },
  plugins: [],
}
