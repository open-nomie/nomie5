
module.exports = {
  purge: [
    "./**/*.svelte",  // Look for .svelte files
    "./**/*.html" // Look for .html files
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    screens: {
      'sm': '0px',
      // => @media (min-width: 640px) { ... }

      'md': '350px',
      // => @media (min-width: 768px) { ... }

      'lg': '800px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
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
  variants: {
    backgroundColor: ['hover', 'responsive', 'focus', 'dark', 'dark-hover'],
    textColor: ['hover', 'responsive', 'focus', 'dark', 'dark-hover'],
  },
  plugins: [require('tailwindcss-dark-mode')(),
  require('@tailwindcss/line-clamp'),
  require('@tailwindcss/typography')]
}
