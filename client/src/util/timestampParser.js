const timestampParser = (referenceTimestamp) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','Decemeber']

  const currentDate = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const parse = (timestamp) => {
    // const timestampWithoutTZ = JSON.stringify(timestamp).replace('Z','')
    const convertedDate = new Date(timestamp)
    const fullYear = convertedDate.getFullYear()
    const monthIndex = convertedDate.getMonth()
    const monthName = monthNames[monthIndex]
    const date = convertedDate.getDate()
    const dayIndex = convertedDate.getDay()
    const dayName = dayNames[dayIndex]
    const hour = convertedDate.getUTCHours()
    const minutes = convertedDate.getMinutes()

    const convertMinutes = (minute) => {
      if(minute < 10){
        return `0${minute}`
      }else{
        return `${minute}`
      }
    }

    const convertHour = (hour24HFormat) => {
      
      if(hour24HFormat > 12){
        const hour12HFormat = hour24HFormat - 12
        const hourPadded = hour12HFormat < 10 ? `0${hour12HFormat}`:`${hour12HFormat}`
        return { convertedHour:hourPadded, meridianString:'PM'}
      }else{
        const hourPadded = hour24HFormat < 10 ? `0${hour24HFormat}`:`${hour24HFormat}`
        return { convertedHour:hourPadded, meridianString:'AM'}
      }
    }

    const { convertedHour, meridianString } = convertHour(hour)
    const convertedMinute = convertMinutes(minutes)

    return {
      year:fullYear,
      monthIndex,
      monthName,
      date,
      dayIndex,
      dayName,
      hour,
      convertedHour,
      minutes,
      convertedMinute,
      meridian:meridianString
    }
  }

  const currentDateParsed = parse(currentDate)
  const yesterdayParsed = parse(yesterday)
  const referenceDateParsed = parse(referenceTimestamp)

  const referenceDateFormatted = `${referenceDateParsed.year}-${referenceDateParsed.monthIndex + 1}-${referenceDateParsed.date}`

  const isToday = referenceDateFormatted == `${currentDateParsed.year}-${currentDateParsed.monthIndex+1}-${currentDateParsed.date}`
  const isYesterday = referenceDateFormatted == `${yesterdayParsed.year}-${yesterdayParsed.monthIndex+1}-${yesterdayParsed.date}`
  return {
    year:referenceDateParsed.year,
    monthName:referenceDateParsed.monthName,
    monthIndex: referenceDateParsed.monthIndex,
    date: referenceDateParsed.date,
    dayName:referenceDateParsed.dayName,
    hour: referenceDateParsed.hour,
    convertedHour: referenceDateParsed.convertedHour,
    minutes: referenceDateParsed.minutes,
    convertedMinutes: referenceDateParsed.convertedMinute,
    meridian: referenceDateParsed.meridian,
    isToday,
    isYesterday
  }
}

export default timestampParser
