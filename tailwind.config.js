const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  purge: [
    "./**/*.svelte",  // Look for .svelte files
    "./**/*.html" // Look for .html files
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        ...defaultTheme.screens,
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}
