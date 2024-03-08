const timestampParser = (timestampNumber) => {
  const convertedDate = new Date(timestampNumber)
  const fullYear = convertedDate.getFullYear()
  const month = convertedDate.getMonth()
  const date = convertedDate.getDate()
  return { fullYear,month,date }
}

export default timestampParser
