const getDateCharacteristics = (referenceDate) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','December']

  const today = new Date() // Today's date in local time
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1) // Yesterday's date according to local time
  const workingDate = new Date(referenceDate) // Date being compared

  const monthIndex = workingDate.getMonth()
  const monthName = monthNames[monthIndex]
  const fullYear = workingDate.getFullYear()
  const date = workingDate.getDate()
  const dayIndex = workingDate.getDay()
  const dayName = dayNames[dayIndex]

  const referenceDateFormatted = `${fullYear}-${monthIndex}-${date}`
  const isToday = referenceDateFormatted == `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  const isYesterday = referenceDateFormatted == `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`

  return {
    isToday,
    isYesterday,
    fullYear,
    monthName,
    monthIndex,
    date,
    dayName
  }

}

export default getDateCharacteristics