const timestampParser = (referenceTimestamp) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','Decemeber']

  const currentDate = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const parse = (timestamp) => {
    const convertedDate = new Date(timestamp)
    const fullYear = convertedDate.getFullYear()
    const monthIndex = convertedDate.getMonth()
    const monthName = monthNames[monthIndex]
    const date = convertedDate.getDate()
    const dayIndex = convertedDate.getDay()
    const dayName = dayNames[dayIndex]
    return {
      year:fullYear,
      monthIndex,
      monthName,
      date,
      dayIndex,
      dayName
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
    date: referenceDateParsed.date,
    dayName:referenceDateParsed.dayName,
    isToday,
    isYesterday
  }
}

export default timestampParser
