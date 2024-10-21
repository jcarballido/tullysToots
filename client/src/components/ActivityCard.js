import React, { useState, useEffect, useRef } from 'react'
import DateComponent from './Date'
import NewRecord from './NewRecord'
// import TimeModal from './TimeModal'
// import ConfirmDeleteModal from './ConfirmationModal'
// import timestampParser from '../util/timestampParser'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import SavedRecord from './SavedRecord'
import EditableRecord from './EditableRecord'
import getDateCharacteristics from '../util/getDateCharacteristics'
import getTimeCharacteristics from '../util/getTimeCharacteristics'
import add from '../media/add.svg'
import edit from '../media/edit.svg'
import confirm from '../media/confirm.svg'
import cancel from '../media/cancel.svg'
import ViewButtons from './ViewButtons'
import AddingButtons from './AddingButtons'
import UpdatingButtons from './UpdatingButtons'


function ActivityCard({ dateString, activityArray, savedActivityMap, editableActivityMap, setEditableActivityMap, setActivity, referencePetId, setTimeModal, setConfirmationModal, activity, setCurrentIndex, current, status, setStatus, confirmationModal }) {
  // console.log('Date string:', dateString)
  //console.log('**ActivityCard Rendered** savedActivityMap: ',  savedActivityMap)
  const axiosPrivate = useAxiosPrivate()
  const containerRef = useRef(null)
  const [ savedRecords, setSavedRecords ] = useState([])
  const [ editableRecords, setEditableRecords ] = useState([])

  const [ newActivity, setNewActivity ] = useState([])
  const [ updateEnabled, setUpdateEnabled ] = useState(false)
  // const [ timeModalVisible, setTimeModalVisible ] = useState(false)
  // const [ confirmationModalVisibility, setConfirmationModalVisibility ] = useState(false)
  // console.log('Date - status', dateString,'-',status)

  useEffect(() => {
    // const parsedActivityArray = activityArray?.map(id => activityMap.get(id)) 
    // activityArray example: [1,2,3]
    // savedRecord example: [{activity_id:1,...},{activity_id:2,...}]
    setSavedRecords(prevRecords => activityArray.map(id => savedActivityMap.get(id)))
    setEditableRecords(prevRecords => activityArray.map(id => editableActivityMap.get(id)))
    
    // setUpdateEnabled(false)
    setStatus({viewing: true, adding: false, updating: false})
  },[activityArray])

  useEffect( () => {
    setEditableRecords(prevRecords => activityArray.map(id => editableActivityMap.get(id)))
  },[editableActivityMap])

  useEffect( () => {
    if(status?.viewing) setNewActivity([])
  }, [ status ])

  useEffect( () => {
    if(newActivity?.length > 0){
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [newActivity] )

  // const { dayName,date, monthName, year, isToday, isYesterday, localTimezoneOffset } = getDateCharacteristics(dateString)

  const addActivity = (e) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      const result = getTimeCharacteristics(new Date().toUTCString())
      // console.log('Activity Card, result: ',result)
      const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(new Date().toUTCString())
      const { fullYear, monthIndex, date } = getDateCharacteristics(dateString)
      // const timestampString = `${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`
      // console.log('ActivityCard, newTimestamp: ', timestampString)
      // const newTimestamp = new Date(`${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`)
      // console.log('ActivityCard, newTimestamp: ', newTimestamp)
      return [...prevNewActivity,{newId:(prevNewActivity.length+1), timestampReceived:new Date(`${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`), pee:true, poo: true}]
    })
  }

  // const deleteNewActivity = (e, key) => {
  //   e.preventDefault()
  //   setNewActivity( prevNewActivity => {
  //     const updatedNewActivityArray = prevNewActivity.filter( newRecord => {
  //       return newRecord.newId != key
  //     })
  //     return updatedNewActivityArray
  //   })
  // }

  const deleteNewActivity = (e, key) => {
    e.preventDefault()
    setNewActivity([])
    // setNewActivity( prevNewActivity => {
    //   const updatedNewActivityArray = prevNewActivity.filter( newRecord => {
    //     return newRecord.newId != key
    //   })
    //   return updatedNewActivityArray
    // })
  }

  const sendNewActivity = async (e) => {
    e.preventDefault()
    try{
      const activity = {
        pee:newActivity[0].pee,
        poo:newActivity[0].poo
      }
      // console.log('Activity being sent:', activity)
      const newActivityTimestamp = `${newActivity[0].timestampReceived}`
      const timezoneOffset = newActivity[0].timestampUTCOffset
      const response = await axiosPrivate.post('/activity/add', {referencePetId, timestampUTCString:newActivityTimestamp, activity})
      // expecting: {'YYYY-MM-DD':[ {},{},... ]}
      const referenceDateActivity = response.data[0]
      // console.log('*RECORD** response.data: ',referenceDateActivity)
      setActivity(prevActivity => {
        const updatedActivityArray = prevActivity.map( dailyActivityLog => {
          const dailyActivityDate = Object.keys(dailyActivityLog)[0]
          const referenceDate = Object.keys(referenceDateActivity)[0]
          if(dailyActivityDate == referenceDate){
            return referenceDateActivity
          }else{
            return dailyActivityLog
          }
        })
        return updatedActivityArray
      })
    }catch(e){
      console.log(e)
    }
  }

  const sendUpdatedActivity = async (e) => {
    e.preventDefault()
  }

  // const deleteExistingActivity = async(event, activityId) => {
  //   event.preventDefault()
  //   // Send delete request
  //   const parameters = {
  //     activityId,
  //     referenceDate:dateString,
  //     referencePetId
  //   }
  //   const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
  //   try{
  //     const response = await axiosPrivate.delete(`/activity/delete?data=${encodedParameters}`)
  //     const referenceDateActivity = response.data[0]
  //     // console.log('*ACTIVITY CARD** response.data[0]: ',referenceDateActivity)
  //     setActivity(prevActivity => {
  //       const updatedActivityArray = prevActivity.map( dailyActivityLog => {
  //         const dailyActivityDate = Object.keys(dailyActivityLog)[0]
  //         const referenceDate = Object.keys(referenceDateActivity)[0]
  //         if(dailyActivityDate == referenceDate){
  //           return referenceDateActivity
  //         }else{
  //           return dailyActivityLog
  //         }
  //       })
  //       return updatedActivityArray
  //     })
  //     setConfirmationModalVisibility(prev => { return {visible:false,activityId:null}})
  //     setUpdateEnabled(false)
  //   }catch(e){
  //     // console.log('**Activity Card** Error deleting existing activity: ', e) 
  //     setConfirmationModalVisibility(prev => { return {visible:false,activityId:null}})
  //   }
  //   // Get updated data for current date back
  //   // Set activity state with new data
  // }

  const enableUpdate = (e) => {
    e.preventDefault()
    setUpdateEnabled(true)
  }

  const disableUpdate = (e) => {
    e.preventDefault()
    setUpdateEnabled(false)
  }

  const compareArrays = ( originalArray, modifiedArray ) => {
    const updates = []
  
    originalArray.map( (elementFromOriginalArray,index) => {
      const elementFromModifiedArray = modifiedArray[index]
      if(JSON.stringify(elementFromOriginalArray) == JSON.stringify(elementFromModifiedArray) ) return
      else{
        const update = {'activity_id':elementFromOriginalArray['activity_id']}
        const keys = Object.keys(elementFromOriginalArray)
        const filteredKeys = keys.filter( key => !key.includes('activity_id'))
        filteredKeys.map( key => {
          if(elementFromOriginalArray[key] != elementFromModifiedArray[key]) return update[key] = elementFromModifiedArray[key]
          else return
        })
        updates.push(update)
      } 
    })
    return updates
  }

  const sendUpdate =  async(e) => {
    // console.log('** Activity Card ** savedRecords',savedRecords)
    // console.log('** Activity Card ** editableRecords',editableRecords)
    const updates = compareArrays(savedRecords, editableRecords)
    // console.log(updates)
    if(updates.length == 0) {
      setEditableActivityMap( prevEditableActivityMap => {
        const originalActivityMap = structuredClone(savedActivityMap)
        return originalActivityMap
      })
      setUpdateEnabled(false)
      return
    }else{
      try{
        console.log('**ActivityCard** updates: ', updates)
        const response = await axiosPrivate.patch('/activity/update', {updatedActivity:updates, referencePetId, dateString})
        const referenceDateActivity = response.data.getSingleDateActivityResult[0]
        // console.log('*ACTIVITY CARD** response.data[0]: ',referenceDateActivity)
        setActivity(prevActivity => {
          const updatedActivityArray = prevActivity.map( dailyActivityLog => {
            const dailyActivityDate = Object.keys(dailyActivityLog)[0]
            const referenceDate = Object.keys(referenceDateActivity)[0]
            if(dailyActivityDate == referenceDate){
              //const activityAray = referenceDateActivity[0]

              return referenceDateActivity
            }else{
              return dailyActivityLog
            }
          })
          console.log('*ActivityCard** result from patch: ', referenceDateActivity)
          console.log('*ActivityCard** updated array after attempting to update state : ', updatedActivityArray)
          return updatedActivityArray
        })
      }catch(e){
        console.log('**Activity Card** Error updating activity: ',e)
        setUpdateEnabled(false)
      }
    }
  //   // 'Collect' updated activity that has been updated using the activity id
  //   // Send the data to the server/db
  //   // Query for the new 'state' of date's data
  //   // Return the results and update 'activity'
  //   try{
  //     const response = await axiosPrivate.post
  //     setUpdateEnabled(false)
  //   }catch(e){
  //     console.log(e)
  //   }
  }

  const handleAdding = (e) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      // const result = getTimeCharacteristics(new Date().toUTCString())
      // console.log('Activity Card, result: ',result)
      const currentTime = new Date()
      const localTimezoneOffset = currentTime.getTimezoneOffset()
      const { paddedHourString, paddedMinutesString, meridianString } = getTimeCharacteristics(currentTime,localTimezoneOffset)
      console.log('On ADD, new date to UTC string:', new Date() )
      console.log('parsed data from new Date:', paddedHourString,' ', paddedMinutesString,' ',meridianString)
      const { fullYear, monthIndex, date } = getDateCharacteristics(dateString)
      // const timestampString = `${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`
      // console.log('ActivityCard, newTimestamp: ', timestampString)
      // console.log(`${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`)
      // console.log('ActivityCard, newTimestamp: ', newTimestamp)
      return [...prevNewActivity,{newId:(prevNewActivity.length+1), timestampReceived:new Date(`${fullYear}-${monthIndex+1}-${date} ${paddedHourString}:${paddedMinutesString} ${meridianString}`), pee:false, poo: false, timestampUTCOffset:localTimezoneOffset}]
    })
    setStatus({ viewing: false, adding:true, updating:false })
  } 

  const handleEditing = (e) => {
    e.preventDefault()
    setStatus({viewing:false, adding:false, updating:true})
  }

  const handleExit = (e) => {
    e.preventDefault()
    setStatus({viewing:true,adding:false,updating:false})
  }

  const handleConfirmingAdding = async(e) => {
    e.preventDefault()
    try{
      const activity = {
        pee:newActivity[0].pee,
        poo:newActivity[0].poo
      }
      console.log('Activity being sent:', activity)
      const newActivityTimestamp = `${newActivity[0].timestampReceived}`
      const timezoneOffset = newActivity[0].timestampUTCOffset
      const response = await axiosPrivate.post('/activity/add', {referencePetId, timestampUTCString:newActivityTimestamp,timezoneOffset, activity})
      // expecting: {'YYYY-MM-DD':[ {},{},... ]}
      const referenceDateActivity = response.data[0]
      // console.log('*RECORD** response.data: ',referenceDateActivity)
      setActivity(prevActivity => {
        const updatedActivityArray = prevActivity.map( dailyActivityLog => {
          const dailyActivityDate = Object.keys(dailyActivityLog)[0]
          const referenceDate = Object.keys(referenceDateActivity)[0]
          if(dailyActivityDate == referenceDate){
            return referenceDateActivity
          }else{
            return dailyActivityLog
          }
        })
        return updatedActivityArray
      })
    }catch(e){
      console.log(e)
    }
  }
  
  const handleConfirmingUpdating = async() => {
    // console.log('** Activity Card ** savedRecords',savedRecords)
    // console.log('** Activity Card ** editableRecords',editableRecords)
    const updates = compareArrays(savedRecords, editableRecords)
    // console.log(updates)
    if(updates.length == 0) {
      setEditableActivityMap( prevEditableActivityMap => {
        const originalActivityMap = structuredClone(savedActivityMap)
        return originalActivityMap
      })
      setStatus({viewing:true,adding:false,updating:false})
      return
    }else{
      try{
        console.log('**ActivityCard** updates: ', updates)
        const response = await axiosPrivate.patch('/activity/update', {updatedActivity:updates, referencePetId, dateString})
        const referenceDateActivity = response.data.getSingleDateActivityResult[0]
        // console.log('*ACTIVITY CARD** response.data[0]: ',referenceDateActivity)
        setActivity(prevActivity => {
          const updatedActivityArray = prevActivity.map( dailyActivityLog => {
            const dailyActivityDate = Object.keys(dailyActivityLog)[0]
            const referenceDate = Object.keys(referenceDateActivity)[0]
            if(dailyActivityDate == referenceDate){
              //const activityAray = referenceDateActivity[0]

              return referenceDateActivity
            }else{
              return dailyActivityLog
            }
          })
          console.log('*ActivityCard** result from patch: ', referenceDateActivity)
          console.log('*ActivityCard** updated array after attempting to update state : ', updatedActivityArray)
          return updatedActivityArray
        })
      }catch(e){
        console.log('**Activity Card** Error updating activity: ',e)
        setStatus({viewing:true,adding:false,updating:false})
      }
    }
  }

  // console.log('Saved records:', savedRecords)
  return(
    <div className='w-full flex flex-col items-center relative h-full gap-12'>
      {/* <TimeModal newActivity={newActivity} setNewActivity={setNewActivity} timeModalVisible={timeModalVisible} setTimeModalVisible={setTimeModalVisible}/> */}
      {/* <ConfirmDeleteModal confirmationModalVisibility={confirmationModalVisibility} setConfirmationModalVisibility={setConfirmationModalVisibility} deleteExistingActivity={deleteExistingActivity}/> */}
      <DateComponent dateString={dateString} />
      <div className='w-full overflow-y-auto flex flex-col justify-start items-center shadow-xl bg-primary rounded-xl' ref={containerRef}>
        { status?.updating 
            ? editableRecords?.map( record => {
              
                return (
                  <div key={`editable_${record.activity_id}`} className='flex items-center justify-center w-full my-4 rounded-lg'>
                    <EditableRecord record={record} setTimeModal={setTimeModal} setEditableActivityMap={setEditableActivityMap} setConfirmationModal={setConfirmationModal} dateString={dateString}/>
                  </div>
                )
            })
            : savedRecords?.map( record => {
                // console.log(`Record in ${dateString}: `, record)
                // console.log('DateString/Record ID:', dateString,'/',record.activity_id)
                if(record.activity_id == undefined) return null
                return (
                  <div key={`saved_${record.activity_id}`} className='w-full flex items-center justify-center py-4'>
                    <SavedRecord record={record} />
                  </div>
                )
            })
        }
        { newActivity.map( record => {
          return (
            <div key={record.newId} className='w-full flex items-center justify-center my-6'>
              <NewRecord record={record} sendNewActivity={sendNewActivity} setNewActivity={setNewActivity} deleteNewActivity={deleteNewActivity} setTimeModal={setTimeModal} dateString={dateString} setEditableActivityMap={setEditableActivityMap} />
            </div>
          )
        })}

      </div>
      <div className='flex justify-center gap-8 items-center w-9/12 mb-8'>
        {
          current
          ? status.viewing
            ? <ViewButtons handleAdding={handleAdding} handleEditing={handleEditing} savedRecords={savedRecords} />
            : status.adding
              ? <AddingButtons handleConfirmAdding={handleConfirmingAdding} handleExit={handleExit}/> 
              : <UpdatingButtons handleConfirmUpdating={handleConfirmingUpdating} handleExit={handleExit} />
          : null
        }
      </div>
    </div>
  )
}

export default ActivityCard

        {/* { updateEnabled
            ? <img onClick={(e) => sendUpdate(e)} className='rounded-xl h-[48px] bg-accent' src={confirm}/>
            : <div className='flex gap-1 justify-center items-center rounded-xl bg-accent px-2'>
              <img onClick={addActivity} disabled={newActivity?.length > 0} className='h-[48px] flex items-center justify-center' src={add} />
              <div className='flex w-full justify-center items-center font-bold'>Add</div>
              </div>
          
        }
        { savedRecords.length > 0 
          ? updateEnabled
            ? <img onClick={disableUpdate} className='rounded-xl w-[48px]' src={cancel} />
            : <div className='flex gap-1 justify-center items-center rounded-xl bg-primary-light px-2'>
                <img onClick={enableUpdate} className='rounded-xl w-[48px]' src={edit} />
                <div className='flex w-full justify-center items-center'>Edit</div>
              </div>
          :null
        } 
        {
          newActivity.length > 0
          ? <div className='flex gap-1 justify-center items-center rounded-xl bg-primary-light px-2'>
              <div>
                <img onClick={sendNewActivity} className='rounded-xl w-[48px]' src={edit} />
                <div>
                  Save
                </div>
              </div>
              <div>
                <div onClick={deleteNewActivity} className='flex w-full justify-center items-center'>X</div>
                <div>
                  Cancel
                </div>
              </div>
            </div>
        :null
        }  */}