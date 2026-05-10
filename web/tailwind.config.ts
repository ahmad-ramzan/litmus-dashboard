import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#3db9a8',
          hover: '#2da899',
          light: '#e8f7f5',
          50: '#f0faf9',
          100: '#e8f7f5',
          200: '#b3ebe4',
          300: '#7dddd3',
          400: '#4ecdc4',
          500: '#3db9a8',
          600: '#2da899',
          700: '#1e9988',
          800: '#107766',
          900: '#065544',
        },
      },
    },
  },
  plugins: [],
};

export default config;
