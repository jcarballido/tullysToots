import React, { useState, useEffect } from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const EditableRecord = ({ record,setConfirmationModal,setTimeModal, setEditableActivityMap, dateString}) => {

  const [ time, setTime ] = useState('')
  
  useEffect( () => {
    const { convertedHour, convertedMinutes, meridian } = timestampParser(record.set_on_at)
    setTime(`${convertedHour}:${convertedMinutes} ${meridian}`)
  },[record])

  const openTimeModal = () => {
    setTimeModal( prevTimeModal => {
      return {
        visible:true,
        new:false,
        recordId:record.activity_id,
        time,
        dateString
      }
    })
  }

  const openConfirmationModal = (e, activityId) => {
    e.preventDefault()
    setConfirmationModal( prevConfirmationModal => {
      return {
        visible:true,
        activityId,
        dateString
      }
    })
  }

  return (
    <div className='w-full border-[2px] border-blue-700 flex items-start'>
      <Checkbox id={record.id} checked={record.pee} activity='pee' />
      <Checkbox id={record.id} checked={record.poo} activity='poo' />
      {/* <input type='time' value={time} className='invisible absolute' disabled /> */}
      <div>@</div>
      <div onClick={() => openTimeModal()} >{time}</div>
      <button onClick={ (e) => openConfirmationModal(e, record.activity_id) }> 
        DELETE
      </button>
    </div>
  )
}

export default EditableRecord
// onClick={(e) => openConfirmationModal(e, record.activity_id)}