import React from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const Record = ({ record, setNewActivity, deleteNewActivity }) => {
    const { convertedHour, minutes, meridian } = timestampParser(record.setOnAt)
    const [ time, setTime ] = useState(`${convertedHour}:${minutes} ${meridian}`)

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
        <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.pee} activity='pee' />
        <Checkbox id={record.id} setNewActivity={setNewActivity} checked={record.poo} activity='poo' />
        <input type='time' value={time} className='invisible absolute' disabled />
        <div>@</div>
        <div>{time}</div>
        <button onClick={sendNewActivity}>
            SAVE
        </button>
        <button onClick={(e) => deleteNewActivity(e,record.newId)} >
            CANCEL
        </button>
    </div>
  )
}

export default Record




