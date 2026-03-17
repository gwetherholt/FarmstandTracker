import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F4',
        parchment: '#F0EDE6',
        wood: '#78716C',
        'wood-dark': '#3D3929',
        olive: '#5B7A3D',
        'olive-dark': '#476230',
        amber: '#D4943A',
        'amber-light': '#F0C96D',
        barn: '#C24444',
        'sage': '#8BAF7B',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config
