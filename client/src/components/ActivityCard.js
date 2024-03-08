import React from 'react'

function ActivityCard({dateString, activityArray, activityMap }) {
  const records = activityArray.map( id => activityMap.get(id))

  return(
    <div className='bg-red-600 h-full w-full'>
      { dateString }
      { records.map( (record,index) => <div key={index} className='max-w-max h-full bg-yellow-200'>{record.pet_id}</div>) }
    </div>
  )
}

export default ActivityCard