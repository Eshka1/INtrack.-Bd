/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Module 2 color tokens
        forest: {
          950: '#06130e',
          900: '#091c15',
          850: '#0d251d',
          800: '#123227',
          700: '#1b4d3e',
        },
        sage: {
          100: '#e8f5e9',
          200: '#c8e6c9',
          300: '#a5d6a7',
          400: '#81c784',
        },
        // Modules 1 & 3 neomorphic tokens
        neuBg: '#0d1310',
        neuCard: '#141b18',
        neuPrimary: '#34d399',
        neuPrimaryDark: '#10b981',
        neuMint: '#6ee7b7',
        neuTextDark: '#f3f5f4',
        neuTextMuted: '#8b968f',
        neuDanger: '#f87171',
        neuBorder: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};