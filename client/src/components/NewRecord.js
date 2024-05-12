import React, { useEffect, useState } from 'react'
import Checkbox from './Checkbox'
// import timestampParser from '../util/timestampParser'
import getTimeCharacteristics from '../util/getTimeCharacteristics'

const NewRecord = ({ record, setNewActivity,sendNewActivity, deleteNewActivity, setTimeModal, dateString }) => {
  const [ timeString, setTimeString ] = useState('')

  const changeTime = () => {
    setTimeModal( prevTimeModal => {
        return {
            visible:true,
            new:true,
            recordId:record.newId,
            time:{ timestampUTC: record.timestampReceived, timezoneOffset:record.timestampUTCOffset } ,
            dateString
          }
    })
  }

  useEffect( () => {
    console.log('New record',record)
    const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.timestampReceived, record.timestampUTCOffset)
    setTimeString(`${paddedHourString}:${paddedMinutesString} ${meridianString}`)
  },[record])

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
      <Checkbox id={record.newId} setNewActivity={setNewActivity} checked={record.pee} activity='pee' />
      <Checkbox id={record.newId} setNewActivity={setNewActivity} checked={record.poo} activity='poo' />
      {/* <input type='time' value={timeString} className='invisible absolute' disabled /> */}
      <div>@</div>
      <div onClick={changeTime}>{timeString}</div>
      <button onClick={sendNewActivity}>
        SAVE
      </button>
      <button onClick={(e) => deleteNewActivity(e,record.newId)} >
        CANCEL
      </button>
    </div>
  )
}

export default NewRecord