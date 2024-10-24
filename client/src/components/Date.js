import React from 'react'
import getDateCharacteristics from '../util/getDateCharacteristics'

const Date = ({ dateString }) => {
    
  const { fullYear,dayName,paddedDate,monthName, isToday, isYesterday, parsedYear, parsedMonth, parsedMonthName, parsedDate } = getDateCharacteristics(dateString)
  // console.log('dateString/paddedDate',dateString,'/',paddedDate)
  
  return(
    <div className='flex items-center justify-center bg-primary rounded-xl max-w-min flex-wrap font-Lato'> 
      <div className=''>
        <div className='max-w-max flex flex-col p-[6px] mx-4'>
          <div className=''>{ dayName }</div>
          <div className='text-xl font-bold min-w-max'>{parsedDate} {parsedMonthName}</div>
          <div className='text-sm'>{fullYear}</div>
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


