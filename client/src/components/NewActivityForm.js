import React from 'react'
import timestampParser from '../util/timestampParser'

const NewActivityForm = ({ timestamp, pee, poo }) => {

  const { hour, minutes } = timestampParser(timestamp)
  const [ time, setTime ] = useState(`${hour}:${minutes}`)


  const handleTimeInput = (e) => {
    const target = e.target
    const value = target.value
    setTime(value)
  }

  return (
    <form>
      <input type='time' aria-label='Time' value={time} onChange={handleTimeInput}/>
      {/* Pee */}
      {/* Poo */}
      <button type='submit'>SEND</button>
    </form>
  )
}

export default NewActivityForm