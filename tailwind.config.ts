import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F8FF',
          100: '#E6EDFF',
          200: '#C8D6FF',
          300: '#A6BAFF',
          400: '#7F96FF',
          500: '#5B73FF',
          600: '#3E55F5',
          700: '#2F41C2',
          800: '#232F8E',
          900: '#1B246B',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(91, 115, 255, 0.45)',
      },
    },
  },
  plugins: [],
}
export default config
