/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream:  '#FBF6EF',
        sand:   '#D9C7B0',
        rose:   '#E3A6B5',
        gold:   '#C9A24B',
        brown:  '#2E2620',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: { '2xl': '16px', '3xl': '24px', '4xl': '32px' },
      animation: {
        'float-up': 'floatUp 8s linear infinite',
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        floatUp:  { '0%': { opacity: 0, transform: 'translateY(0)' }, '10%': { opacity: .7 }, '90%': { opacity: .2 }, '100%': { opacity: 0, transform: 'translateY(-100vh)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
