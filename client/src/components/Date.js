import React from 'react'
import getDateCharacteristics from '../util/getDateCharacteristics'

const Date = ({ dateString }) => {
  // console.log('Date string passed to Date component:', dateString)
  const { year,dayName, isToday, isYesterday, parsedMonthName, date, referenceDateSplit,dateIndex,workingReferenceDate } = getDateCharacteristics(dateString)
  // console.log('dateString/paddedDate',dateString,'/',`${year}-${parsedMonthName}-${date}`,'/referenceDateSplit:',referenceDateSplit,'/date index:', dateIndex)
  // console.log('Working date ref date:',workingReferenceDate)
  
  return(
    <div className='flex items-center justify-center bg-primary rounded-xl max-w-min flex-wrap font-Lato'> 
      <div className=''>
        <div className='max-w-max flex flex-col p-[6px] mx-4'>
          <div className=''>{ dayName }</div>
          <div className='text-xl font-bold min-w-max'>{date} {parsedMonthName}</div>
          <div className='text-sm'>{year}</div>
        </div> 
        {/* {dateString} */}
      </div>
      <div className={`${isToday || isYesterday ? 'visible':'invisible'} font-bold flex items-center justify-center`}>
        {isToday? 'TODAY' : isYesterday? 'YESTERDAY' : null}
      </div>
    </div>
  )
}

export default Date


