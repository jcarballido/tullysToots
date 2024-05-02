import React, { useState, useEffect } from 'react'
import DateComponent from './Date'
import NewRecord from './NewRecord'
// import TimeModal from './TimeModal'
// import ConfirmDeleteModal from './ConfirmationModal'
import timestampParser from '../util/timestampParser'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import SavedRecord from './SavedRecord'
import EditableRecord from './EditableRecord'

function ActivityCard({ dateString, activityArray, savedActivityMap, editableActivityMap, setEditableActivityMap, setActivity, referencePetId, setTimeModal, setConfirmationModal }) {
  // console.log(`${dateString} activityArray: `, activityArray)
  const axiosPrivate = useAxiosPrivate()
  const [ savedRecords, setSavedRecords ] = useState([])
  const [ editableRecords, setEditableRecords ] = useState([])

  const [ newActivity, setNewActivity ] = useState([])
  const [ updateEnabled, setUpdateEnabled ] = useState(false)
  // const [ timeModalVisible, setTimeModalVisible ] = useState(false)
  // const [ confirmationModalVisibility, setConfirmationModalVisibility ] = useState(false)

  useEffect(() => {
    // const parsedActivityArray = activityArray?.map(id => activityMap.get(id)) 
    // activityArray example: [1,2,3]
    // savedRecord example: [{activity_id:1,...},{activity_id:2,...}]
    setSavedRecords(prevRecords => activityArray.map(id => savedActivityMap.get(id)))
    setEditableRecords(prevRecords => activityArray.map(id => editableActivityMap.get(id)))
    
    setUpdateEnabled(false)
  },[activityArray])

  useEffect( () => {
    setEditableRecords(prevRecords => activityArray.map(id => editableActivityMap.get(id)))
  },[editableActivityMap])

  const { dayName,date, monthName, year, isToday, isYesterday } = timestampParser(dateString)

  const addActivity = (e) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      const { hour, convertedMinutes } = timestampParser(new Date())
      return [...prevNewActivity,{newId:(prevNewActivity.length+1), setOnAt:new Date(`${dateString} ${hour}:${convertedMinutes}`), pee:true, poo: true}]
    })
  }

  const deleteNewActivity = (e, key) => {
    e.preventDefault()
    setNewActivity( prevNewActivity => {
      const updatedNewActivityArray = prevNewActivity.filter( newRecord => {
        return newRecord.newId != key
      })
      return updatedNewActivityArray
    })
  }

  const sendNewActivity = async (e) => {
    e.preventDefault()
    try{
      const activity = {
        pee:newActivity[0].pee,
        poo:newActivity[0].poo
      }
      const newActivityTimestamp = `${newActivity[0].setOnAt}`
      const response = await axiosPrivate.post('/activity/add', {referencePetId, referenceDate:newActivityTimestamp, activity})
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
      setNewActivity(prevNewActivity => [])
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

  // savedRecord example: [{activity_id:1,...},{activity_id:2,...}]

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

  const sendUpdate =  (e) => {
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
        const response = axiosPrivate.patch('/activity/update', {updatedActivity:updates, referencePetId, dateString})
        const referenceDateActivity = response.data.getSingleDateActivityResult
        // console.log('*ACTIVITY CARD** response.data[0]: ',referenceDateActivity)
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

  // const openConfirmationModal = (e, activity_id) => {
  //   e.preventDefault()
  //   setConfirmationModalVisibility(prevDeletion => { return {visible:true,activityId:activity_id}})
  // }

  return(
    <div className='bg-red-600 h-full w-full flex flex-col items-center relative'>
      {/* <TimeModal newActivity={newActivity} setNewActivity={setNewActivity} timeModalVisible={timeModalVisible} setTimeModalVisible={setTimeModalVisible}/> */}
      {/* <ConfirmDeleteModal confirmationModalVisibility={confirmationModalVisibility} setConfirmationModalVisibility={setConfirmationModalVisibility} deleteExistingActivity={deleteExistingActivity}/> */}
      <DateComponent dayName={dayName} date={date} monthName={monthName} year={year} isToday={isToday} isYesterday={isYesterday} />
      { updateEnabled 
          ? editableRecords?.map( record => {
              return (
                <div key={record.activity_id} className='max-w-max border-red-700 border-6 flex items-center justify-center bg-gray-300'>
                  <EditableRecord record={record} setTimeModal={setTimeModal} setEditableActivityMap={setEditableActivityMap} setConfirmationModal={setConfirmationModal} dateString={dateString}/>
                </div>
              )
          })
          : savedRecords?.map( record => {
              // console.log(`Record in ${dateString}: `, record)
              return (
                <div key={record.activity_id} className='max-w-max flex items-center justify-center'>
                  <SavedRecord record={record} />
                </div>
              )
          })
      }
      { newActivity.map( record => {
        return (
          <div key={record.newId} className='max-w-full border-4 border-yellow-700'>
            <NewRecord record={record} sendNewActivity={sendNewActivity} setNewActivity={setNewActivity} deleteNewActivity={deleteNewActivity} setTimeModalVisible={setTimeModalVisible} />
          </div>
        )
      })}
      <div className='flex justify-center items-center border-black border-2'>
      { updateEnabled
        ? <button onClick={(e) => sendUpdate(e)} className='border-2 border-white rounded-xl'>CONFIRM</button>
        : <div className='flex justify-center items-center'>
            <button onClick={addActivity} disabled={newActivity?.length > 0} className='border-2 border-white rounded-xl max-w-max disabled:bg-gray-700 disabled:text-white'>
              ADD
            </button>
          </div>
      }
      { savedRecords.length > 0 
        ? updateEnabled
          ? <button onClick={disableUpdate} className='border-2 border-red-700 rounded-xl '>CANCEL</button>
          : <button onClick={enableUpdate} className='border-2 border-green-700 rounded-xl'>UPDATE</button>
        :null}  
      </div>
    </div>
  )
}

export default ActivityCard