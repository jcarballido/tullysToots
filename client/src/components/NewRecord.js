import React, { useState } from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const NewRecord = ({ record, setNewActivity,sendNewActivity, deleteNewActivity, setTimeModalVisible }) => {

  const { convertedHour, convertedMinutes, meridian } = timestampParser(record.setOnAt)
  console.log('Record meridian: ', meridian)
  const time = `${convertedHour}:${convertedMinutes} ${meridian}`

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
      <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.pee} activity='pee' />
      <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.poo} activity='poo' />
      <input type='time' value={time} className='invisible absolute' disabled />
      <div>@</div>
      <div onClick={() => setTimeModalVisible(true)}>{time}</div>
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




