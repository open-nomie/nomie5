const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  purge: [
    "./**/*.svelte",  // Look for .svelte files
    "./**/*.html" // Look for .html files
  ],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      screen: {
        'xs': { min: "0px", max: "350px" }
      },
      colors: {
        primary: {
          50: "#DBF2FD",
          100: "#B3E5FC",
          200: "#81D4FA",
          300: "#4FC3F7",
          400: "#29B6F6",
          500: "#03A9F4",
          600: "#039BE5",
          700: "#0277BD",
          800: "#004E70",
          900: "#01579B",
        }
      }
    }
  },
  // variants: {
  //   extend: {},
  // },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}
