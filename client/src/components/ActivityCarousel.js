import React, {  useEffect, useState } from 'react'
import ActivityCard from './ActivityCard'
import timestampParser from '../util/timestampParser.js'
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import TimeModal from './TimeModal.js';
import ConfirmationModal from './ConfirmationModal.js'

const ActivityCarousel = ({ dateMap, savedActivityMap, editableActivityMap, setEditableActivityMap, setActivity, referencePetId, referenceDate, setReferenceDate, activity }) => {

  const axiosPrivate = useAxiosPrivate()
  const [ currentIndex, setCurrentIndex ] = useState(7);
  // const [ presentReferenceDate, setPresentReferenceDate ] = useState(null)
  // const [ activity, setActivity ] = useState([])
  const [ activityArr, setActivityArr ] = useState([])
  // const [ editableActivityMap, setEditableActivityMap ] = useState(activityMap)
  const [ today, setToday ] = useState(false)
  // const [ yesterday, setYesterday ] = useState(false)
  // const [ workingActivityId, setWorkingActivityId ] = useState(null)
  const [ timeModal, setTimeModal ] = useState({visible:false,new:false, recordId:null,time:''})
  const [ confirmationModal, setConfirmationModal ] = useState({visible:false, recordId:null})

  useEffect( () => {
    const { isToday } = timestampParser(referenceDate)
    setToday(isToday)
  },[referenceDate])

  useEffect( () => {
    if(currentIndex == 0){
      const fetchData = async() => {
        const timeWindow = { 
          daysBefore:3, 
          daysAfter:0
        }
        const parameters = {
          referencePetId:JSON.stringify(referencePetId), 
          referenceDate, 
          timeWindow
        }
        const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
        const response = await axiosPrivate.get(`/activity/get?data=${encodedParameters}`)
        const newActivity = response.data
        setActivity( (prevActivity) => {
          const rawActivity = structuredClone(prevActivity)
          rawActivity.unshift(...newActivity)
          return rawActivity
        })
        setCurrentIndex(3)
      }
      fetchData()
    }
  }, [currentIndex])

  useEffect( () => {
    setActivityArr(Array.from(dateMap))
  },[dateMap])

  const nextCard = (e) => {
    e.preventDefault()
    setCurrentIndex((prevIndex) => prevIndex + 1);
    const entries = Array.from(dateMap.entries())
    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex+1][0]
    setReferenceDate(activeReferenceDate)
    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
  };

  const prevCard = (e) => {
    e.preventDefault()
    setCurrentIndex((prevIndex) => prevIndex - 1)
    const entries = Array.from(dateMap.entries())
    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex-1][0]
    setReferenceDate(activeReferenceDate)
    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
  };

  // const updateActivtyMap = (e, activityId) => {
  //   e.preventDefault()
  //   setEditableActivityMap(/* use activityId to update activity map */)
  // }
  
  const deleteExistingActivity = async(event, activityId, dateString) => {
    event.preventDefault()
    // Send delete request
    const parameters = {
      activityId,
      referencePetId,
      referenceDate:dateString,
    }
    const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
    try{
      const response = await axiosPrivate.delete(`/activity/delete?data=${encodedParameters}`)
      const referenceDateActivity = response.data[0]
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
        // console.log('')
        return updatedActivityArray
      })
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
    }catch(e){
      // console.log('**Activity Card** Error deleting existing activity: ', e) 
      console.log('ERROR deleting existing activity: ',e)
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
    }
    // Get updated data for current date back
    // Set activity state with new data
  }

  // console.log('**ActivityCarousel Rendered** activitArr: ', activityArr)
  // console.log('**ActivityCarousel Rendered** savedActivityMap: ',  savedActivityMap)
  return (
    <div className="w-full flex items-center justify-center relative">
      <TimeModal timeModal={ timeModal } setTimeModal={setTimeModal} setEditableActivityMap={ setEditableActivityMap } />
      <ConfirmationModal confirmationModal={confirmationModal} setConfirmationModal={setConfirmationModal} deleteExistingActivity={deleteExistingActivity}/> 
      <button onClick={prevCard} className="px-0 py-2 bg-blue-500 text-white absolute bottom-4 left-4 z-10">
        Previous
      </button>
      <button disabled={today} onClick={nextCard} className={`px-0 py-2 bg-blue-500 text-white absolute bottom-4 right-4 z-10 disabled:bg-red-500`} >
        Next
      </button>
      <div
        className="flex w-screen transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)`}}
      >
        {
          activityArr.map(([dateString, activityArray]) => {
            
            return (
              <div
                key={dateString}
                className={`shrink-0 w-full min-h-48 border-[10px] border-yellow-400 text-black text-[24px] px-4`}
              >
                <ActivityCard dateString={ dateString } activityArray={ activityArray } editableActivityMap={editableActivityMap} setEditableActivityMap={setEditableActivityMap} savedActivityMap={ savedActivityMap } setActivity={ setActivity } referencePetId={referencePetId} setTimeModal={setTimeModal} setConfirmationModal={setConfirmationModal} activity={activity}/>
              </div>
            )
          })
        }   
      </div>
    </div>
  );
};

export default ActivityCarousel
