import React from 'react'
import timestampParser from '../util/timestampParser'
import Checkbox from './Checkbox'
import getTimeCharacteristics from '../util/getTimeCharacteristics'

const SavedRecord = ({ record }) => {
  // console.log('Record: ', record)
  // console.log('Record set on at: ', record.set_on_at)
  // const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.timestamp_received, record.timestamp_utc_offset)
  const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.set_on_at, record.timezone_offset_hours  )

  // console.log('**Saved Record** Parsed: ',convertedHour, convertedMinutes, meridian)
  const time = `${paddedHourString}:${paddedMinutesString} ${meridianString}`

  return (
    <div className='flex flex-col justify-start items-center w-10/12'>
      <div className='w-full flex justify-between items-center '>
        <Checkbox id={record.id} checked={record.pee} activity='pee' disabled={true}/>
        <Checkbox id={record.id} checked={record.poo} activity='poo' disabled={true}/>
        <div className='flex justify-between items-center min-w-[125px] gap-2'>
          <div className='flex justify-center items-center'>@</div>
          <div className='flex justify-center items-center'>{time}</div>
        </div>  
      </div>
      <div className='flex justify-start items-center w-full italic text-gray-700 text-sm'>
        Entered by: {record.set_by}
      </div>
    </div>
  )
}

export default SavedRecord