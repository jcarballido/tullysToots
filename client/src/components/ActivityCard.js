import React from 'react'
import Date from './Date'
import timestampParser from '../util/timestampParser'

function ActivityCard({ dateString, activityArray, activityMap }) {
  const records = activityArray.map( id => activityMap.get(id))
  
  const { dayName,date, monthName, year, isToday, isYesterday } = timestampParser(dateString)

  return(
    <div className='bg-red-600 h-full w-full'>
      <Date dayName={dayName} date={date} monthName={monthName} year={year} isToday={isToday} isYesterday={isYesterday} />
      { records.map( (record,index) => <div key={index} className='max-w-max h-full bg-yellow-200'>{record.pet_id}</div>) }
    </div>
  )
}

export default ActivityCard