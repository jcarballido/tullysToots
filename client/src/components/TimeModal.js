import React, { useEffect, useState } from 'react'
import timestampParser from '../util/timestampParser'

const TimeModal = ({ newActivity, setNewActivity, timeModalVisible, setTimeModalVisible }) => {
  // console.log('TimeModal timestamp parsed results: ', convertedHour,' ',convertedMinutes, ' ',initialMeridian)
  const [ hour,setHour ] = useState('06')
  const [ minutes,setMinutes ] = useState('00')
  const [ meridian, setMeridian ] = useState('AM')

  useEffect( () => {
    const record = newActivity[0]
    // console.log('TimeModal record: ', record)
    const timestamp = record?.setOnAt
    const { convertedHour, convertedMinutes, meridian:initialMeridian } = timestampParser(timestamp)
    // console.log('Converted minutes: ', convertedMinutes)
    setHour(convertedHour)
    setMinutes(convertedMinutes)
    setMeridian(initialMeridian)
  },[newActivity])

  const handleHourChange = (e) => {
    const target = e.target
    let value = parseInt(target.value) || 0
    if(value.length > 2 || value > 12 || value < 0) return
    setHour(`${value}`)
  }
  const handleMinutesChange = (e) => {
    const target = e.target
    const value = parseInt(target.value) || 0
    if(value.length > 2 || value > 59 || value < 0) return
    setMinutes(`${value}`) 
  }
  const handleMinuteBlur = () => {
    if(minutes < 10) setMinutes(`0${parseInt(minutes)}`)
  }
  const handleHourBlur = () => {
    if(hour < 10 && hour != 0) setHour(`0${parseInt(hour)}`)
    else if (hour < 10 && hour == 0) setHour('12')
  }
  
  const handleChange = (e) => {
    const value = e.target.value
    console.log('TimeModal value: ', value)
    setMeridian(value)
  }
  
  const handleTimeSet = () => {
    setNewActivity( prevNewActivity => {
      const recordId = prevNewActivity[0]?.newId
      // console.log('TimeModal record ID: ', recordId)
      const updatedNewActivity = prevNewActivity.map( newRecord => {
        if(newRecord.newId != recordId) {
          console.log('Record IDs in TimeModal did not match; new activity was not updated')
          return newRecord
        }else{
          console.log('Record ID match; update made')
          const recordTimestamp = newRecord.setOnAt
          const { year, monthIndex, date } = timestampParser(recordTimestamp)
          const adjustedHour = meridian == 'PM'? (hour+12) : hour
          // const updatedTimestamp = 'year-month-day HH:MM'
          newRecord['setOnAt'] = new Date(year,monthIndex,date,adjustedHour,minutes,0)
          return newRecord
        }
      })

      return updatedNewActivity
    })
    // setTimeModalVisible(false)
  }
  const closeModal = () => {
    setTimeModalVisible(false)
  }
  
  return(
    <div className={`w-full h-full z-20 border-4 border-red-500 flex flex-col items-center justify-start absolute transform origin-center ${timeModalVisible ? 'backdrop-grayscale scale-100':'backdrop-grayscale-0 scale-0'}`}>
      <div className='w-3/4 h-3/4 flex items-center justify-center gap-2'>
        <input type='text' value={hour} onChange={handleHourChange} className='w-1/4 border-2 border-blue-500' onBlur={handleHourBlur}/>
        <input type='text'value={minutes} onChange={handleMinutesChange} className='w-1/4 border-2 border-blue-500' onBlur={handleMinuteBlur}/>
        <label>
          <input type='radio' name='test' onChange={handleChange} value='AM' checked={ meridian == 'AM' } />
          AM
          <input type='radio' name='test' onChange={handleChange} value='PM' checked={ meridian == 'PM'} />
          PM
        </label> 
          
      </div>   
      <div className='flex justify-center items-center gap-4'>
        <div onClick={handleTimeSet}>
          OK  
        </div>
        <div onClick={closeModal}>
          CANCEL  
        </div>
      </div>
    </div>
  )
}

export default TimeModal