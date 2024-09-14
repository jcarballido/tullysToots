import React from 'react'
import timestampParser from '../util/timestampParser'
import Checkbox from './Checkbox'
import getTimeCharacteristics from '../util/getTimeCharacteristics'

const SavedRecord = ({ record }) => {
  // console.log('Record: ', record)
  // console.log('Record set on at: ', record.set_on_at)
  // const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.timestamp_received, record.timestamp_utc_offset)
  const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.set_on_at)

  // console.log('**Saved Record** Parsed: ',convertedHour, convertedMinutes, meridian)
  const time = `${paddedHourString}:${paddedMinutesString} ${meridianString}`

  return (
    <div className='w-full border-[2px] border-pink-700 flex items-start'>
      <Checkbox id={record.id} checked={record.pee} activity='pee' disabled={true}/>
      <Checkbox id={record.id} checked={record.poo} activity='poo' disabled={true}/>
      <div>@</div>
      <div>{time}</div>
    </div>
  )
}

export default SavedRecord