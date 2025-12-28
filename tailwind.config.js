/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbcdd6',
          300: '#f7a5b7',
          400: '#ef4d68',
          500: '#e63c5a',
          600: '#d02a4a',
          700: '#b01f3d',
          800: '#921d38',
          900: '#7d1c34',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
