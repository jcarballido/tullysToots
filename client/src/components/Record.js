import React from 'react'
import Checkbox from './Checkbox'
import timestampParser from '../util/timestampParser'

const Record = ({ time, pee, poo }) => {

  return (
    <div className='w-full border-[2px] border-solid border-red-400 flex items-start'>
      <Checkbox display='pee' pee={pee}/>
      <Checkbox display='poo' poo={poo} />
      <input type='time' value={time} className='invisible absolute' disabled />
      <div>@</div>
      <div>{time}</div>
    </div>
  )
}

export default Record





