import React, { useState, useEffect } from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'
import getTimeCharacteristics from '../util/getTimeCharacteristics'
import deleteIcon from '../media/delete.svg'

const EditableRecord = ({ record,setConfirmationModal,setTimeModal, setEditableActivityMap, dateString}) => {

  const [ time, setTime ] = useState('')
  
  useEffect( () => {
    console.log('*Editable Record*: ', record)
    const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(record.set_on_at,record.timezone_offset_hours)
    console.log('Parsed time:',paddedHourString,'  ', paddedMinutesString,'   ', meridianString)
    setTime(`${paddedHourString}:${paddedMinutesString} ${meridianString}`)
  },[record])

  const openTimeModal = () => {
    setTimeModal( prevTimeModal => {
      return {
        visible:true,
        new:false,
        recordId:record.activity_id,
        time:{ timestampUTC: record.set_on_at, timezoneOffset: record.timezone_offset_hours } ,
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
    <div className='w-11/12 bg-primary-light flex items-start justify-between rounded-lg p-4 gap-2 shadow-md'>
      <div className='flex justify-evenly items-center basis-2/3 gap-1'>
        <Checkbox id={record.activity_id} checked={record.pee} activity='pee' setEditableActivityMap={setEditableActivityMap} />
        <Checkbox id={record.activity_id} checked={record.poo} activity='poo' setEditableActivityMap={setEditableActivityMap} />
        {/* <input type='time' value={time} className='invisible absolute' disabled /> */}
        <div>@</div>
        <div onClick={() => openTimeModal()} className='min-w-max'>{time}</div>
      </div>
      <img className='h-[48px] bg-red-500 rounded-xl p-1' onClick={ (e) => openConfirmationModal(e, record.activity_id) } src={deleteIcon} /> 
    </div>
  )
}

export default EditableRecord
// onClick={(e) => openConfirmationModal(e, record.activity_id)}