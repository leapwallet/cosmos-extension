/* global module */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      Satoshi: ['Satoshi', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px',
      jumbo: '48px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    colors: {
      ...defaultTheme.colors,
      mainChainTheme: {
        100: '#754f9c66',
        200: '#1B45F5',
        400: '#754f9c',
      },
      green: {
        300: '#8CE3BF',
        600: '#29A874',
        700: '#1F7F58',
        800: '#165A3E',
        900: '#0D3525',
      },
      red: {
        100: '#FFD1D6',
        200: '#FFADB5',
        300: '#FF707E',
        600: '#D10014',
        800: '#70000B',
        900: '#420006',
      },
      gray: {
        50: '#F4F4F4',
        100: '#E8E8E8',
        200: '#D6D6D6',
        300: '#B8B8B8',
        400: '#9E9E9E',
        600: '#696969',
        700: '#696969',
        800: '#383838',
        900: '#212121',
      },
      black: {
        50: '#0000000F',
        100: '#000000',
      },
      white: {
        0: '#00000000',
        30: '#FFFFFF1E',
        100: '#FFFFFF',
      },
      indigo: {
        300: '#8583EC',
      },
      yellow: {
        500: '#FFCE0A',
        600: '#D1A700',
      },
      orange: {
        300: '#FFC770',
        500: '#FF9F0A',
        600: '#D17F00',
      }
    },
    extend: {
      animation: {
        fadeIn: 'fadeIn 2s ease-in-out',
        translate: 'translateY 1s ease-in-out',
      },
      keyframes: (theme) => ({
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        translateY: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50px)' },
        },
      }),
    },
  },
  plugins: [],
}
