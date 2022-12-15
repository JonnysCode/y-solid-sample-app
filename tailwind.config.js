const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#ed7147',
          DEFAULT: '#ec6233',
          dark: '#d4582d',
        },
        secondary: {
          light: '#4ca6ce',
          DEFAULT: '#2090c2',
          dark: '#1c81ae',
        },
        accent: {
          light: '#eec25d',
          DEFAULT: '#ebb537',
          dark: '#d3a231',
        },
        neutral: {
          light: '#efe7e0',
          DEFAULT: '#ebe1d9',
          dark: '#d3cac3',
        },
      },
      backgroundImage: {
        hexagon: "url('./assets/hexagon.svg')",
        hexagon2: "url('./assets/solid-background.svg')",
      },
      boxShadow: {
        full: '-8px 8px black',
        full_sm: '-4px 4px black',
      },
      fontFamily: {
        sans: ['Space\\ Grotesk', 'Georgia', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('flowbite/plugin'), require('@tailwindcss/typography')],
};
