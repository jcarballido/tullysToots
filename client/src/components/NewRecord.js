import React, { useEffect, useState } from 'react'
import Checkbox from './Checkbox'
// import timestampParser from '../util/timestampParser'
import getTimeCharacteristics from '../util/getTimeCharacteristics'

const NewRecord = ({ record, setNewActivity,sendNewActivity, deleteNewActivity, setTimeModal, dateString, setEditableActivityMap }) => {
  const [ timeString, setTimeString ] = useState('')

  useEffect(() =>{
    console.log('New record rendered:', record)
  })

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
  })

  return (
    <div className='w-10/12 shadow-2xl bg-primary-dark flex items-center justify-between rounded-xl p-4'>
      <Checkbox newRecord={true} id={record.newId} setNewActivity={setNewActivity} checked={record.pee} activity='pee'/>
      <Checkbox newRecord={true} id={record.newId} setNewActivity={setNewActivity} checked={record.poo} activity='poo'/>
      {/* <input type='time' value={timeString} className='invisible absolute' disabled /> */}
      <div>@</div>
      <div onClick={changeTime}>{timeString}</div>
      {/* <button onClick={sendNewActivity}>
        SAVE
      </button>
      <button onClick={(e) => deleteNewActivity(e,record.newId)} >
        CANCEL
      </button> */}
    </div>
  )
}

export default NewRecord