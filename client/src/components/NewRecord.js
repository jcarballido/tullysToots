import React, { useState } from 'react'
import Checkbox from './Checkbox'
// import timestampParser from '../util/timestampParser'

const NewRecord = ({ record, setNewActivity,sendNewActivity, deleteNewActivity, setTimeModal, dateString }) => {

  const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.timestampReceieved)
  // console.log('Record meridian: ', meridian)
  const time = `${paddedHourString}:${paddedMinutesString} ${meridianString}`

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

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
      <Checkbox id={record.newId} setNewActivity={setNewActivity} checked={record.pee} activity='pee' />
      <Checkbox id={record.newId} setNewActivity={setNewActivity} checked={record.poo} activity='poo' />
      <input type='time' value={time} className='invisible absolute' disabled />
      <div>@</div>
      <div onClick={changeTime}>{time}</div>
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