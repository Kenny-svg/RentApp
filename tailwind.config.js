/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d8ecff',
          500: '#1d4ed8',
          600: '#1e40af',
          700: '#1e3a8a'
        },
        accent: {
          500: '#059669',
          600: '#047857'
        }
      },
      boxShadow: {
        soft: '0 8px 30px rgba(2, 6, 23, 0.08)'
      }
    }
  },
  plugins: []
};
