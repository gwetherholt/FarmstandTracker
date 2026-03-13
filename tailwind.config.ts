import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#faf6ee',
        parchment: '#f0e8d8',
        wood: '#8b7355',
        'wood-dark': '#6b5740',
        olive: '#78713f',
        'olive-dark': '#5c572f',
        amber: '#d4a843',
        'amber-light': '#e8c96a',
        barn: '#9b3b3b',
        'sage': '#a8b89c',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
