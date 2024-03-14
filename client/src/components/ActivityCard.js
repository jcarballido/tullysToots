import React from 'react'
import Date from './Date'

function ActivityCard({dateString, activityArray, activityMap, referenceDateParsed }) {
  const records = activityArray.map( id => activityMap.get(id))

  const { dayName,date, monthName, year, isToday, isYesterday } = referenceDateParsed

  return(
    <div className='bg-red-600 h-full w-full'>
      <Date dayName={dayName} date={date} monthName={monthName} year={year} isToday={isToday} isYesterday={isYesterday} />
      { records.map( (record,index) => <div key={index} className='max-w-max h-full bg-yellow-200'>{record.pet_id}</div>) }
    </div>
  )
}

export default ActivityCard