const getDateCharacteristics = (referenceDate) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','December']

  const today = new Date() // Today's date in local time
  const todayOffsetAdjusted = today.setHours(today.getHours()-(today.getTimezoneOffset()/60)) // Adjust time to prepare for ISO string conversion
  const todaySplit = new Date(todayOffsetAdjusted).toISOString().split('T')
  const todayDateCaptured = todaySplit[0]

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1) // Yesterday's date according to local time
  const yesterdayOffsetAdjusted = yesterday.setHours(yesterday.getHours()-(yesterday.getTimezoneOffset()/60))
  const yesterdaySplit = new Date(yesterdayOffsetAdjusted).toISOString().split('T')
  const yesterdayDateCaptured = yesterdaySplit[0]

  const workingReferenceDate = new Date(referenceDate)
  // yesterday.setDate(yesterday.getDate() - 1) // Yesterday's date according to local time
  const workingReferenceDateOffsetAdjusted = workingReferenceDate.setHours(workingReferenceDate.getHours()+(workingReferenceDate.getTimezoneOffset()/60))
  const workingReferenceDateSplit = new Date(workingReferenceDateOffsetAdjusted).toISOString().split('T')
  const workingReferenceDateCaptured = workingReferenceDateSplit[0]

  // const convertedReferenceDate = new Date(workingReferenceDateOffsetAdjusted)
  // const monthIndex = convertedReferenceDate.getMonth()
  const referenceDateSplit = referenceDate.split('-')
  const year = referenceDateSplit[0]
  const date = referenceDateSplit[2]
  const month = referenceDateSplit[1]
  const dateIndex = workingReferenceDate.getDay()
  const dayName = dayNames[dateIndex]

  const parsedMonthName = monthNames[month-1]

  // const todaySplit = today.toJSON().split('T')
  // const todayDate = todaySplit[0]


  // const todayDateCaptured = todaySplit[0]
  // const yesterdaySplit = yesterday.toISOString().split('T')
  // const yesterdayDateCaptured = yesterdaySplit[0]

  // const workingDate = new Date(referenceDate) // Date being compared
  // const isoString = workingDate.toISOString()
  // const test = new Date()
  // const updatedTesta = test.setHours(test.getHours() - ((test.getTimezoneOffset())/60))
  // const updatedTestb = new Date(updatedTesta).toISOString().split('T')
  // const updatedTest = updatedTestb[0]

  // const isoStringSplit = isoString.split('T')
  // const dateCaptured = isoStringSplit[0]
  // console.log('date captured in getDateChar:', dateCaptured)
  // const dateParsed = dateCaptured.split('-')
  // const utcDate = new Date(Date.UTC(dateParsed[0], dateParsed[1] -1, dateParsed[2]))

  // const parsedYear = dateParsed[0]
  // const parsedMonth = dateParsed[1]
  // const parsedMonthName = monthNames[parsedMonth-1]
  // const parsedDate = dateParsed[2]

  // const monthIndex = workingDate.getUTCMonth()
  // const monthName = monthNames[monthIndex]
  // const fullYear = workingDate.getUTCFullYear()
  // const date = workingDate.getUTCDate()
  // const dayIndex = utcDate.getUTCDay()
  // const dayName = dayNames[dayIndex]

  // const paddedMonth = monthIndex < 10 && monthIndex+1 != 10
  //   ? `0${monthIndex+1}`
  //   : `${monthIndex+1}`

  // const paddedDate = date < 10 
  //   ? `0${date}`
  //   : `${date}`

  

  // const referenceDateFormatted = referenceDate
  // const isToday = dateCaptured == `${today.getUTCFullYear()}-${today.getUTCMonth()+1}-${today.getUTCDate()}`
  // const isYesterday = dateCaptured == `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()+1}-${yesterday.getUTCDate()}`

  const isToday = workingReferenceDateCaptured == todayDateCaptured
  const isYesterday = workingReferenceDateCaptured == yesterdayDateCaptured


  return {
    isToday,
    isYesterday,
    year,
    wDayCapt:workingReferenceDateCaptured,
    yDayCapt: yesterdayDateCaptured,
    tDayCapt: todayDateCaptured,
    workingReferenceDate,
    // // monthName,
    month,
    date,
    dateIndex,
    dayName,
    // parsedYear,
    // parsedMonth,
    parsedMonthName,
    referenceDateSplit
    // parsedDate,
    // today:todaySplit,
    // yesterday:yesterdayDateCaptured,
    // updatedTest
  }

}

export default getDateCharacteristics