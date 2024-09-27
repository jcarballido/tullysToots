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
          'primary':'#F0E6D6'
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
  