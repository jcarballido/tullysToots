import React, { useState, useEffect } from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const EditableRecord = ({ record,setConfirmationModal,setTimeModal, setEditableActivityMap, dateString}) => {

  const [ time, setTime ] = useState('')
  
  useEffect( () => {
    // console.log('Editable record, set on at: ',record.set_on_at)
    // console.log('Editable record, set on at typeof: ', typeof(record.set_on_at))
    const timezoneRemoval =/(?<= \d{2}:\d{2}:\d{2}).*/
    const timestampStringified = `${record.set_on_at}`
    console.log('timestampStringified: ',timestampStringified)
    const strippedTimezone = timestampStringified.replace(timezoneRemoval,'')
    console.log('**EditableRecord** stripped time: ', strippedTimezone)
    const dateOb = new Date(strippedTimezone)
    console.log('dateOb in locale string: ', dateOb.toLocaleString())
    const { convertedHour, convertedMinutes, meridian } = timestampParser(dateOb.toLocaleString())
    console.log('Editable record, convertedHour: ',convertedHour)

    setTime(`${convertedHour}:${convertedMinutes} ${meridian}`)
  },[record])

  const openTimeModal = () => {
    setTimeModal( prevTimeModal => {
      return {
        visible:true,
        new:false,
        recordId:record.activity_id,
        time:record.set_on_at,
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
      <Checkbox id={record.activity_id} checked={record.pee} activity='pee' setEditableActivityMap={setEditableActivityMap} />
      <Checkbox id={record.activity_id} checked={record.poo} activity='poo' setEditableActivityMap={setEditableActivityMap} />
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