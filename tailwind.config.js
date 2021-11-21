const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  purge: [
    "./**/*.svelte",  // Look for .svelte files
    "./**/*.html" // Look for .html files
  ],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      'xs': { min: "0px", max: "350px" },
    }
  },
  // variants: {
  //   extend: {},
  // },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}
