/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="night"]'],
  theme: {
    extend: {
      colors: {
        sky: 'var(--sky)', ocean: 'var(--ocean)', 'ocean-deep': 'var(--ocean-deep)',
        gold: 'var(--gold)', 'gold-2': 'var(--gold-2)', sand: 'var(--sand)',
        ink: 'var(--ink)', 'ink-2': 'var(--ink-2)', 'ink-3': 'var(--ink-3)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { DEFAULT: '18px', lg: '26px', pill: '50px' },
    },
  },
  plugins: [],
}
