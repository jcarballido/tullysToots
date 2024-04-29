import React from 'react'
import timestampParser from '../util/timestampParser'
import Checkbox from './Checkbox'

const SavedRecord = ({ record }) => {
  // console.log('Record: ', record)
  // console.log('Record set on at: ', record.sett)
  const { convertedHour, convertedMinutes, meridian } = timestampParser(record.set_on_at)
  // console.log('Parsed: ',convertedHour, convertedMinutes, meridian)
  const time = `${convertedHour}:${convertedMinutes} ${meridian}`

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