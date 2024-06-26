import React from 'react'
import getDateCharacteristics from '../util/getDateCharacteristics'

const Date = ({ dateString }) => {

    const { fullYear,dayName,date,monthName, isToday, isYesterday } = getDateCharacteristics(dateString)
  
  return(
    <div className='border-solid border-[10px] border-green-700 flex items-center justify-center'> 
      <div className='basis-1/3'>
        <div className='border-2 border-black border-solid max-w-max flex flex-col p-[6px] ml-4'>
          <div className=''>{ dayName }</div>
          <div className='text-xl font-bold min-w-max'>{date} {monthName}</div>
          <div className='text-sm'>{fullYear}</div>
        </div>
      </div>
      <div className={`${isToday || isYesterday ? 'visible':'invisible'} basis-2/3 font-bold flex items-center justify-center`}>
        {isToday? 'TODAY' : isYesterday? 'YESTERDAY' : null}
      </div>
    </div>
  )
}

export default Date


