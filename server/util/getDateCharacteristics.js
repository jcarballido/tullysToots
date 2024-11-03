const getDateCharacteristics = (referenceDate) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','December']

  const today = new Date() // Today's date in local time
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1) // Yesterday's date according to local time
  const workingDate = new Date(referenceDate) // Date being compared
  const isoString = workingDate.toISOString()
  const isoStringSplit = isoString.split('T')
  const dateCaptured = isoStringSplit[0]

  let parsedYear
  let parsedDate
  let parsedMonthName
  let parsedMonth
  let utcDate

  if(typeof referenceDate == 'string'){
    const dateParsed = referenceDate.split('-')
    const dateTrimmed = dateParsed.map( number => number.replace('"','') )
    console.log('*getDateChar* date parsed:', dateTrimmed)
    console.log('*getDateChar* date elements:', dateTrimmed[0], dateTrimmed[1] -1, dateTrimmed[2])
    utcDate = new Date(Date.UTC(dateTrimmed[0], dateTrimmed[1] -1, dateTrimmed[2]))
    console.log('*getDateChar* utcDate:', utcDate)

    parsedYear = dateParsed[0]
    parsedMonth = dateParsed[1]
    parsedMonthName = monthNames[parsedMonth-1]
    parsedDate = dateParsed[2]
  }

  const monthIndex = workingDate.getUTCMonth()
  const monthName = monthNames[monthIndex]
  const fullYear = workingDate.getUTCFullYear()
  const date = typeof referenceDate == 'string' ? utcDate.getUTCDate() : workingDate.getUTCDate()
  const dayIndex = workingDate.getUTCDay()
  const dayName = dayNames[dayIndex]

  const referenceDateFormatted = `${dateCaptured}`
  const isToday = referenceDateFormatted == `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`
  const isYesterday = referenceDateFormatted == `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`

  return {
    isToday,
    isYesterday,
    fullYear,
    monthName,
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