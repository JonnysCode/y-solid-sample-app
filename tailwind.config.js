const colors = require('tailwindcss/colors');

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
        primary: colors.indigo,
        secondary: colors.yellow,
        neutral: colors.zinc,
      },
      backgroundImage: {
        hexagon: "url('./assets/hexagon.svg')",
        hexagon2: "url('./assets/solid-background.svg')",
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
