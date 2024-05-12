const getTimeCharacteristics = ( referenceTimestampUTC,referenceTimestampOffsetMinutes=new Date().getTimezoneOffset()) => {

  const convertedReferenceTimestamp = new Date(referenceTimestampUTC)
  const localTimezoneOffset = new Date().getTimezoneOffset()
  const timezoneOffsetDifference = ( referenceTimestampOffsetMinutes - localTimezoneOffset ) * 60 * 1000 // ms
  
  const workingReferenceTimestamp = timezoneOffsetDifference == 0? convertedReferenceTimestamp : new Date(convertedReferenceTimestamp.getTime() - timezoneOffsetDifference)

  const hour = workingReferenceTimestamp.getHours()
  const minutes = workingReferenceTimestamp.getMinutes()

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
    localTimezoneOffset
  }
}

export default getTimeCharacteristics

/*
const getTimeCharacteristics = ( referenceTimestampUTC,referenceTimestampOffsetMinutes=new Date().getTimezoneOffset()) => {

  const convertedReferenceTimestamp = new Date(referenceTimestampUTC)
  const localTimezoneOffset = new Date().getTimezoneOffset()
  const timezoneOffsetDifference = ( referenceTimestampOffsetMinutes - localTimezoneOffset ) * 60 * 1000 // ms
  
  const workingReferenceTimestamp = timezoneOffsetDifference == 0? convertedReferenceTimestamp : new Date(convertedReferenceTimestamp.getTime() - timezoneOffsetDifference)

  const hour = workingReferenceTimestamp.getHours()
  const minutes = workingReferenceTimestamp.getMinutes()

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
    localTimezoneOffset
  }
}

export default getTimeCharacteristics
*/