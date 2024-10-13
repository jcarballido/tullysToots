module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
      extend: {
        backgroundImage:{
          'dogDoodle':"url('./images/dogDoodle.jpeg')"
        },
        minHeight: {
          '33':'33%'
        },
        maxHeight: {
          '33':'33%'
        },
        colors: {
          'accent': '#77B5FE',
          'secondary':'#DCC6E0',
          'secondary-dark':'#6B1F7B',
          'secondary-light':'#e6d7e9',
          'primary':'#F0E6D6',
          'primary-dark':'#d8cfc0',
          'primary-light':'#f6f0e6'
        },
        fontFamily: {
          'Borel': [ 'Borel','cursive' ],
          'Fredoka': [ "Fredoka", "sans-serif" ],
          'Lato': [ "Lato", "sans-serif"]
        }
      }
    },
    plugins: [],
  }
  