import React, { useEffect, useState } from 'react'
// import timestampParser from '../util/timestampParser'
import getTimeCharacteristics from '../util/getTimeCharacteristics'

const TimeModal = ({ timeModal, setTimeModal, setEditableActivityMap, editableActivityMap, newActivity, setNewActivity }) => {

  // console.log('TimeModal/Time modal passed in:', timeModal)
  console.log('TimeModal/ editableActivityMap:', editableActivityMap)
  const [ hour,setHour ] = useState('')
  const [ hourFocus, setHourFocus ] = useState(false)
  const [ minutes,setMinutes ] = useState('')
  const [ minutesFocused, setMintuesFocused ] = useState(false)
  const [ meridian, setMeridian ] = useState('')
  const [ timeSet, setTimeSet ] = useState(true)

  useEffect( () => {
    if(timeModal?.visible){
      const { time } = timeModal
      const { timestampUTC, timezoneOffset } = time
      // console.log('**TimeModal** time received for TimeModal: ', time)
      // console.log('**TimeModal** time type receieved for TimeModal: ', typeof(time))
      // console.log('TimeModal record: ', record)
      const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(timestampUTC, timezoneOffset)
      
      // console.log('**TimeModal** time parsed for TimeModal: ', convertedHour, convertedMinutes, initialMeridian)
      // console.log('Converted minutes: ', convertedMinutes)
      setHour(paddedHourString)
      setMinutes(paddedMinutesString)
      setMeridian(meridianString)
    }
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
    setMintuesFocused(false)
  }
  const handleHourBlur = () => {
    if(hour < 10 && hour != 0) setHour(`0${parseInt(hour)}`)
    else if (hour < 10 && hour == 0) setHour('12')
    setTimeSet(true)
    setHourFocus(false)
  }
  const handleChange = (e) => {
    const value = e.target.value
    // console.log('TimeModal value: ', value)
    setMeridian(value)
  } 
  const closeModal = () => {
    setTimeModal({visible:false, recordId:null})
  }
  const handleHourFocus =() => {
    setTimeSet(false)
    setHourFocus(true)
  }
  const handleMinutesFocus =() => {
    setTimeSet(false)
    setMintuesFocused(true)
  } 
  const handleTimeSet = (e) => {
    e.preventDefault()
    if(!timeModal.new){
      // editableActivityMap: { 1: {id:1,pee:true,poo:false}, 2:{id:1,pee:true,poo:false}, 3:{id:1,pee:true,poo:false}}
      setEditableActivityMap( prevEditableActivityMap => {
        const updateMap = structuredClone(prevEditableActivityMap)
        // console.log('**TimeModal** updateMap: ',updateMap)
        const timestamp = new Date(`${timeModal.dateString} ${hour}:${minutes} ${meridian}`).toUTCString()
        console.log('**TimeModal** handleTimeSet timestamp: ', timestamp)
        updateMap.set(timeModal.recordId,{...prevEditableActivityMap.get(timeModal.recordId),'set_on_at':timestamp,'timestamp_offset_hours':new Date().getTimezoneOffset() })
        // console.log('**TimeModal** updateMap result: ',updateMap)
        return updateMap
      })
      setTimeModal({ visible:false, new:false, activityId:null, time:{timestampUTC:'', timezoneOffset:0} })
    }else{
      setNewActivity( prevNewActivity => {
        const clonedNewRecord = prevNewActivity[0]
        // console.log('**TimeModal** updateMap: ',updateMap)
        console.log('TimeModal/ timeModal:', timeModal)
        const timestamp = new Date(`${timeModal.dateString} ${hour}:${minutes} ${meridian}`).toString()
        console.log('**TimeModal** handleTimeSet timestamp: ', timestamp)
        clonedNewRecord['timestampReceived'] = timestamp
        // clonedNewActivity.set(timeModal.recordId,{...prevEditableActivityMap.get(timeModal.recordId),'timestamp_received':timestamp,'timestamp_utc_offset':new Date().getTimezoneOffset() })
        // console.log('**TimeModal** updateMap result: ',updateMap)
        console.log('TimeModal/ clonedNewRecordl', clonedNewRecord)
        return [clonedNewRecord]
      })
      setTimeModal({ visible:false, new:false, activityId:null, time:{timestampUTC:'', timezoneOffset:0} })
    }   
  }

  if(timeModal?.visible){
    return(
      <>
        <div className={`absolute inset-0 flex flex-col justify-center items-center text-black font-Fredoka text-2xl z-50 backdrop-grayscale backdrop-blur-sm`}> 
          {/* <Toast visible={visible} result={result} message={message} setToast={setToast}/> */}
          {/* {error ? <div className='absolute mt-16 bg-red-700 z-50 '>'Error adding pet</div>:null} */}
          <div className={ `transition flex flex-col gap-5 justify-start items-center text-black z-10 mt-16 bg-primary border-8 border-secondary-dark p-4 rounded-2xl w-11/12 ` }>
            <div className='flex w-full justify-center items-center gap-2'>
              <label className={`flex justify-center items-center w-1/4`}>
                <input type='text' value={hour} onChange={handleHourChange} className='max-w-full flex justify-center items-center rounded-md border-2 border-gray-500 focus:border-0 focus:ring-4 focus:ring-accent focus:outline-none px-1' onBlur={handleHourBlur} onFocus={handleHourFocus} />
              </label>:
              <label className={`flex justify-center items-center  w-1/4`}>
                <input type='text' value={minutes} onChange={handleMinutesChange} className={`max-w-full flex justify-center items-center rounded-md border-2 border-gray-500 focus:border-0 focus:ring-4 focus:ring-accent focus:outline-none px-1`} onBlur={handleMinuteBlur} onFocus={handleMinutesFocus} />
              </label>
              <label className='flex justify-center items-center'>
                <input type='radio' name='test' onChange={handleChange} value='AM' checked={ meridian == 'AM' } className='peer appearance-none invisible'/>
                <div className='border-2 rounded-md peer-checked:border-accent peer-checked:border-4 border-gray-500 px-2'>AM</div>
              </label>
              <label className='flex justify-center items-center'>
                <input type='radio' name='test' onChange={handleChange} value='PM' checked={ meridian == 'PM'} className='peer appearance-none invisible'/>
                <div className='border-2 rounded-md peer-checked:border-accent peer-checked:border-4 border-gray-500 px-2'>PM</div>
              </label> 
            </div>
            <div className='flex justify-center items-center gap-4'>
              <button onClick={(e) => handleTimeSet(e)} disabled={!timeSet} className={`bg-accent text-white h-[48px] px-4 rounded-md font-bold`}>
                OK  
              </button>
              <div onClick={closeModal} className={`border-2 border-secondary-dark text-black h-[48px] px-4 flex justify-center items-center rounded-md` }>
                CANCEL  
              </div>
            </div>   
          </div>
        </div> 
        {/* <div className={`w-full h-full z-20 border-4 border-red-500 flex flex-col items-center justify-start absolute transform origin-center ${timeModal.visible ? 'bg-gray-700 scale-100':'scale-0'}`}>
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
        </div> */}
      </>
    )
  }else {return null}
}

export default TimeModal