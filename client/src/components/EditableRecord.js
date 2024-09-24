import React, { useState, useEffect } from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'
import getTimeCharacteristics from '../util/getTimeCharacteristics'
import deleteIcon from '../media/delete.svg'

const EditableRecord = ({ record,setConfirmationModal,setTimeModal, setEditableActivityMap, dateString}) => {

  const [ time, setTime ] = useState('')
  
  useEffect( () => {
    const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.set_on_at)
    setTime(`${paddedHourString}:${paddedMinutesString} ${meridianString}`)
  },[record])

  const openTimeModal = () => {
    setTimeModal( prevTimeModal => {
      return {
        visible:true,
        new:false,
        recordId:record.activity_id,
        time:{ timestampUTC: record.set_on_at } ,
        dateString
      }
    })
  }

  const openConfirmationModal = (e, activityId) => {
    console.log('Editable Record activityId: ', activityId)
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
    <div className='w-full border-[2px] border-accent flex items-start justify-between p-2 rounded-lg'>
      <div className='flex justify-evenly items-center basis-2/3'>
        <Checkbox id={record.activity_id} checked={record.pee} activity='pee' setEditableActivityMap={setEditableActivityMap} />
        <Checkbox id={record.activity_id} checked={record.poo} activity='poo' setEditableActivityMap={setEditableActivityMap} />
        {/* <input type='time' value={time} className='invisible absolute' disabled /> */}
        <div>@</div>
        <div onClick={() => openTimeModal()} >{time}</div>
      </div>
      <img className='w-[48px]' onClick={ (e) => openConfirmationModal(e, record.activity_id) } src={deleteIcon} /> 
    </div>
  )
}

export default EditableRecord
// onClick={(e) => openConfirmationModal(e, record.activity_id)}