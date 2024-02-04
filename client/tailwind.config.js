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
          'accent-blue': '#40e0d0'
        }
      }
    },
    plugins: [],
  }
  