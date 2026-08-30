/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        neuBg:'#e8efeb',
        neuPrimary:'#2c5c47',
        neuMint:'#82b89e',
        neuTextDark:'#1f3830',
        neuTextMuted:'#547064'
      }
    },
  },
  plugins: [],
}
