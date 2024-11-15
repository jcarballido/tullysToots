const getTimeCharacteristics = ( referenceTimestampUTC, referenceTimezoneMinutes ) => {

  const convertedReferenceTimestamp = new Date(referenceTimestampUTC)
  console.log('convertedReferenceTimestamp:',convertedReferenceTimestamp)
  const localTimezoneOffset = new Date().getTimezoneOffset()
  console.log('local TZ offset:',localTimezoneOffset)
  const timezoneOffsetDifference = ( parseInt(referenceTimezoneMinutes) - localTimezoneOffset )
  console.log('difference: ', timezoneOffsetDifference)
  const workingReferenceTimestamp = timezoneOffsetDifference == 0? convertedReferenceTimestamp : new Date(convertedReferenceTimestamp.getTime() - timezoneOffsetDifference)
  console.log('getTimeChar: ', workingReferenceTimestamp)
  const hour = workingReferenceTimestamp.getHours()
  const minutes = workingReferenceTimestamp.getMinutes()
  // const hour = convertedReferenceTimestamp.getHours()
  // const minutes = convertedReferenceTimestamp.getMinutes()
  const meridianString = hour > 12 ? 'PM':'AM'

  const paddedHourString = hour < 10 
    ? '0' + hour.toString() 
    : hour > 12
      ? (hour - 12).toString()
      : hour.toString()
  const paddedMinutesString = minutes < 10 ? '0' + minutes.toString() : minutes.toString()

  return {
    hour,
    paddedHourString,
    minutes,
    paddedMinutesString,
    meridianString,
    // localTimezoneOffset
  }
}

export default getTimeCharacteristics