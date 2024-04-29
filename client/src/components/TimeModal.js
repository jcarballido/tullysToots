import React, { useEffect, useState } from 'react'
import timestampParser from '../util/timestampParser'

const TimeModal = ({ timeModal, setTimeModal, setEditableActivityMap }) => {

  const [ hour,setHour ] = useState('')
  const [ minutes,setMinutes ] = useState('')
  const [ meridian, setMeridian ] = useState('')
  const [ timeSet, setTimeSet ] = useState(true)

  useEffect( () => {
    const { time } = timeModal
    // console.log('TimeModal record: ', record)
    const { convertedHour, convertedMinutes, meridian:initialMeridian } = timestampParser(time)
    // console.log('Converted minutes: ', convertedMinutes)
    setHour(convertedHour)
    setMinutes(convertedMinutes)
    setMeridian(initialMeridian)
  },[timeModal])

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
    setTimeSet(true)
  }
  const handleHourBlur = () => {
    if(hour < 10 && hour != 0) setHour(`0${parseInt(hour)}`)
    else if (hour < 10 && hour == 0) setHour('12')
    setTimeSet(true)
  }
  const handleChange = (e) => {
    const value = e.target.value
    console.log('TimeModal value: ', value)
    setMeridian(value)
  } 
  const closeModal = () => {
    setTimeModal({visible:false, recordId:null})
  }
  const handleHourFocus =() => {
    setTimeSet(false)
  }
  const handleMinutesFocus =() => {
    setTimeSet(false)
  } 
  const handleTimeSet = (e) => {
    e.preventDefault()
    if(!timeModal.new){
      // editableActivityMap: { 1: {id:1,pee:true,poo:false}, 2:{id:1,pee:true,poo:false}, 3:{id:1,pee:true,poo:false}}
      setEditableActivityMap( prevEditableActivityMap => {
        const updateMap = new Map(prevEditableActivityMap)
        console.log('**TimeModal** updateMap: ',updateMap)
        const timestamp = new Date(`${timeModal.dateString} ${hour}:${minutes} ${meridian}`)
        updateMap.set(timeModal.recordId,{...prevEditableActivityMap.get(timeModal.recordId),'set_on_at':timestamp })
        return updateMap
      })
      setTimeModal({visible:false, new:false, activityId:null, time:''})
    }else{
      setTimeModal({visible:false, new:false, activityId:null, time:''})
    }   
  }

  return(
    <div className={`w-full h-full z-20 border-4 border-red-500 flex flex-col items-center justify-start absolute transform origin-center ${timeModal.visible ? 'bg-gray-700 scale-100':'scale-0'}`}>
      <div className='w-3/4 h-3/4 flex items-center justify-center gap-2 text-black'>
        <input type='text' value={hour} onChange={handleHourChange} className='w-1/4 border-2 border-blue-500' onBlur={handleHourBlur} onFocus={handleHourFocus} />
        <input type='text'value={minutes} onChange={handleMinutesChange} className='w-1/4 border-2 border-blue-500' onBlur={handleMinuteBlur} onFocus={handleMinutesFocus} />
        <label>
          <input type='radio' name='test' onChange={handleChange} value='AM' checked={ meridian == 'AM' } />
          AM
          <input type='radio' name='test' onChange={handleChange} value='PM' checked={ meridian == 'PM'} />
          PM
        </label> 
          
      </div>   
      <div className='flex justify-center items-center gap-4'>
        <button onClick={(e) => handleTimeSet(e)} disabled={!timeSet} className={` bg-yellow-500 disabled:bg-red-700`}>
          OK  
        </button>
        <div onClick={closeModal}>
          CANCEL  
        </div>
      </div>
    </div>
  )
}


// const TimeModal = ({ newActivity, setNewActivity, timeModalVisible, setTimeModalVisible }) => {
//   // console.log('TimeModal timestamp parsed results: ', convertedHour,' ',convertedMinutes, ' ',initialMeridian)
//   const [ hour,setHour ] = useState('06')
//   const [ minutes,setMinutes ] = useState('00')
//   const [ meridian, setMeridian ] = useState('AM')
//   const [ timeSet, setTimeSet ] = useState(true)

//   useEffect( () => {
//     const record = newActivity[0]
//     // console.log('TimeModal record: ', record)
//     const timestamp = record?.setOnAt || record?.set_on_at
//     const { convertedHour, convertedMinutes, meridian:initialMeridian } = timestampParser(timestamp)
//     // console.log('Converted minutes: ', convertedMinutes)
//     setHour(convertedHour)
//     setMinutes(convertedMinutes)
//     setMeridian(initialMeridian)
//   },[newActivity])

//   const handleHourChange = (e) => {
//     const target = e.target
//     let value = parseInt(target.value) || 0
//     if(value.length > 2 || value > 12 || value < 0) return
//     setHour(`${value}`)
//   }
//   const handleMinutesChange = (e) => {
//     const target = e.target
//     const value = parseInt(target.value) || 0
//     if(value.length > 2 || value > 59 || value < 0) return
//     setMinutes(`${value}`) 
//   }
//   const handleMinuteBlur = () => {
//     if(minutes < 10) setMinutes(`0${parseInt(minutes)}`)
//     setTimeSet(true)
//   }
//   const handleHourBlur = () => {
//     if(hour < 10 && hour != 0) setHour(`0${parseInt(hour)}`)
//     else if (hour < 10 && hour == 0) setHour('12')
//     setTimeSet(true)
//   }
  
//   const handleChange = (e) => {
//     const value = e.target.value
//     console.log('TimeModal value: ', value)
//     setMeridian(value)
//   }  
  
//   const handleTimeSet = (e) => {
//     e.preventDefault()
//     setNewActivity( prevNewActivity => {
//       const recordId = prevNewActivity[0]?.newId
//       // console.log('TimeModal record ID: ', recordId)
//       const updatedNewActivity = prevNewActivity.map( newRecord => {
//         if(newRecord.newId != recordId) {
//           console.log('Record IDs in TimeModal did not match; new activity was not updated')
//           return newRecord
//         }else{
//           console.log('Record ID match; update made')
//           const recordTimestamp = newRecord.setOnAt
//           const { year, monthIndex, date } = timestampParser(recordTimestamp)
//           const adjustedHour = meridian == 'PM'? `${parseInt(hour)+12}` : hour
//           console.log('Time Modal adjusted Hour : ',adjustedHour)
//           // const updatedTimestamp = 'year-month-day HH:MM'
//           newRecord['setOnAt'] = new Date(year,monthIndex,date,adjustedHour,minutes,0)
//           return newRecord
//         }
//       })

//       return updatedNewActivity
//     })
//     setTimeModalVisible(false)
//   }
//   const closeModal = () => {
//     setTimeModalVisible(false)
//   }

//   const handleHourFocus =() => {
//     setTimeSet(false)
//   }

//   const handleMinutesFocus =() => {
//     setTimeSet(false)
//   }  
//   return(
//     <div className={`w-full h-full z-20 border-4 border-red-500 flex flex-col items-center justify-start absolute transform origin-center ${timeModalVisible ? 'backdrop-grayscale scale-100':'backdrop-grayscale-0 scale-0'}`}>
//       <div className='w-3/4 h-3/4 flex items-center justify-center gap-2'>
//         <input type='text' value={hour} onChange={handleHourChange} className='w-1/4 border-2 border-blue-500' onBlur={handleHourBlur} onFocus={handleHourFocus} />
//         <input type='text'value={minutes} onChange={handleMinutesChange} className='w-1/4 border-2 border-blue-500' onBlur={handleMinuteBlur} onFocus={handleMinutesFocus} />
//         <label>
//           <input type='radio' name='test' onChange={handleChange} value='AM' checked={ meridian == 'AM' } />
//           AM
//           <input type='radio' name='test' onChange={handleChange} value='PM' checked={ meridian == 'PM'} />
//           PM
//         </label> 
          
//       </div>   
//       <div className='flex justify-center items-center gap-4'>
//         <button onClick={handleTimeSet} disabled={!timeSet} className={` bg-yellow-500 disabled:bg-red-700`}>
//           OK  
//         </button>
//         <div onClick={closeModal}>
//           CANCEL  
//         </div>
//       </div>
//     </div>
//   )
// }

export default TimeModal