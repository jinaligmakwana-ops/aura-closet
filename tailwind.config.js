/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F4EFEA',
          200: '#E7DDD3',
          300: '#D5C4B4',
          400: '#BFA690',
          500: '#A78B71',
          600: '#8C7058',
          700: '#705844',
          800: '#544233',
          900: '#3D3025',
        },
        terracotta: {
          50: '#FDF6F3',
          100: '#FBE9E3',
          500: '#D97757',
          600: '#C25E3E',
          700: '#A44A2D',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E5EDE5',
          200: '#CADBCA',
          500: '#6E8F6E',
          600: '#557355',
          700: '#405740',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
