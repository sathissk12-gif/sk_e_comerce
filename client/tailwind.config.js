/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F2',
        card: '#FFFFFF',
        'deep-green': {
          DEFAULT: '#173B32',
          hover: '#112d26',
          dark: '#0c221c',
          light: '#235347'
        },
        sage: {
          DEFAULT: '#A8B9A5',
          light: '#e8eee6',
          dark: '#879983'
        },
        'warm-beige': {
          DEFAULT: '#F3EBDD',
          dark: '#e8dcce',
          light: '#faf6f0'
        },
        'muted-gold': {
          DEFAULT: '#C8A96B',
          hover: '#b59759',
          dark: '#a18347',
          light: '#f7f1e5'
        },
        charcoal: '#17201D',
        'secondary-text': '#68736E'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-short': 'bounceShort 1s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceShort: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }
    },
  },
  plugins: [],
}
