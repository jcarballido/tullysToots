import React from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const EditableRecord = ({ updateEnabled, record,openConfirmationModal,setTimeModalVisible }) => {

  const { convertedHour, convertedMinutes, meridian } = timestampParser(record.set_on_at)
  const time = `${convertedHour}:${convertedMinutes} ${meridian}`

  return (
    <div className='w-full border-[2px] border-blue-700 flex items-start'>
      <Checkbox id={record.id} checked={record.pee} activity='pee' />
      <Checkbox id={record.id} checked={record.poo} activity='poo' />
      {/* <input type='time' value={time} className='invisible absolute' disabled /> */}
      <div>@</div>
      <div onClick={() => setTimeModalVisible(true)}>{time}</div>
      {updateEnabled
      ? <button onClick={(e) => openConfirmationModal(e, record.activity_id)}>
          DELETE
        </button>
      : null
      }
    </div>
  )
}

export default EditableRecord