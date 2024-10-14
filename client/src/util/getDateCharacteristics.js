const getDateCharacteristics = (referenceDate) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','December']

  const today = new Date() // Today's date in local time
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1) // Yesterday's date according to local time
  const workingDate = new Date(referenceDate) // Date being compared
  console.log('refDate/workingDate', referenceDate,'/',workingDate)


  const dateParsed = referenceDate.split('-')
  const utcDate = new Date(Date.UTC(dateParsed[0], dateParsed[1] -1, dateParsed[2]))

  const parsedYear = dateParsed[0]
  const parsedMonth = dateParsed[1]
  const parsedMonthName = monthNames[parsedMonth-1]
  const parsedDate = dateParsed[2]

  const monthIndex = workingDate.getMonth()
  const monthName = monthNames[monthIndex]
  const fullYear = workingDate.getFullYear()
  const date = workingDate.getDate()
  const dayIndex = utcDate.getUTCDay()
  const dayName = dayNames[dayIndex]

  const paddedMonth = monthIndex < 10 
    ? `0${monthIndex+1}`
    : `${monthIndex+1}`

  const paddedDate = date < 10 
    ? `0${date}`
    : `${date}`

  

  const referenceDateFormatted = `${fullYear}-${monthIndex}-${date}`
  const isToday = referenceDateFormatted == `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const isYesterday = referenceDateFormatted == `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`

  return {
    isToday,
    isYesterday,
    fullYear,
    monthName,
    paddedMonth,
    paddedDate,
    monthIndex,
    date,
    dayName,
    parsedYear,
    parsedMonth,
    parsedMonthName,
    parsedDate
  }

}

export default getDateCharacteristics