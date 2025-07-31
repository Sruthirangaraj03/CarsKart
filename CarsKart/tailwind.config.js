// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Urbanist"', 'sans-serif'],
      },
      colors: {
        orangebeige: {
          50: '#fffaf0',
          100: '#fef3dc',
          200: '#fde4ba',
          300: '#fbd393',
          400: '#f8b85a',
          500: '#f59e2c',  // main
          600: '#ea7f1b',
          700: '#c46111',
          800: '#9a4b10',
          900: '#7a3c0e',
        },
      },
    },
  },
  plugins: [],
};
