import React, {  useEffect, useState } from 'react'
import ActivityCard from './ActivityCard'
// import timestampParser from '../util/timestampParser.js'
import getDateCharacteristics from '../util/getDateCharacteristics.js';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import TimeModal from './TimeModal.js';
import ConfirmationModal from './ConfirmationModal.js'
import leftArrow from '../media/left_arrow.svg' 
import rightArrow from '../media/right_arrow.svg' 

const ActivityCarousel = ({ dateMap, savedActivityMap, editableActivityMap, setEditableActivityMap, setActivity, referencePetId, referenceDate, setReferenceDate, activity }) => {

  const axiosPrivate = useAxiosPrivate()
  const [ currentIndex, setCurrentIndex ] = useState(4);
  const [ today, setToday ] = useState(false)
  const [ timeModal, setTimeModal ] = useState({visible:false,new:false, recordId:null,time:''})
  const [ confirmationModal, setConfirmationModal ] = useState({visible:false, recordId:null})

  const activityArr = Array.from(dateMap)

  const fetchAdditionalData = async(timeWindowObj) => {
    console.log('*Carousel* timeWindow: ', timeWindowObj)
    // const timeWindow = { 
    //     daysBefore:3, 
    //     daysAfter:0
    //   }
      const parameters = {
        referencePetId:JSON.stringify(referencePetId), 
        referenceDate, 
        timeWindowObj
      }
      const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
      try{
        const response = await axiosPrivate.get(`/activity/get?data=${encodedParameters}`)
        const newActivity = response.data.activityArray
        // console.log('*Activity Carousel* newActivity: ', newActivity)
        if(timeWindowObj.daysBefore){
            setActivity( (prevActivity) => {
                const rawActivity = structuredClone(prevActivity)
                rawActivity.unshift(...newActivity)
              //   console.log('*Raw activity* : ', rawActivity)
                return rawActivity
            })
            
        }else{
            setActivity( (prevActivity) => {
                const rawActivity = structuredClone(prevActivity)
                rawActivity.push(...newActivity)
              //   console.log('*Raw activity* : ', rawActivity)
                return rawActivity
              })
            
        }
        
      }catch(e){
        console.log('*Activity Card* Error caught trying to fetch more activity cards:', e)
      }
  }

  useEffect( () => {
    const { isToday } = getDateCharacteristics(referenceDate)
    setToday(isToday)
  },[referenceDate])


  useEffect( () => {
    if(currentIndex == 0){
      fetchAdditionalData({ daysBefore:3, daysAfter:0 })
    }else if(currentIndex == activityArr.length - 1){
      fetchAdditionalData({ daysBefore:0, daysAfter:3 })
    }
  }, [currentIndex])

  useEffect( () =>{
    if(currentIndex == 0 || currentIndex == activityArr.length - 1){
      const mapKeys = dateMap.keys()
      const mapKeysArray = Array.from(mapKeys)
      const index = mapKeysArray.indexOf(referenceDate)
      if(index != -1) setCurrentIndex(index)
      else console.log('Did not find reference date in updated dateMap. Reference date/dateMap: ', referenceDate,'/', dateMap)
    }
  },[ dateMap  ])

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
      console.log('ERROR deleting existing activity: ',e)
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
    }
  }

  return (
    <div className="w-11/12 flex items-start justify-center relative overflow-x-hidden rounded-xl">
      <TimeModal timeModal={ timeModal } setTimeModal={setTimeModal} setEditableActivityMap={ setEditableActivityMap } />
      <ConfirmationModal confirmationModal={confirmationModal} setConfirmationModal={setConfirmationModal} deleteExistingActivity={deleteExistingActivity}/> 
      <img onClick={prevCard} className="absolute top-4 left-4 z-10 w-[48px]" src={leftArrow} />
      <img disabled={today} onClick={nextCard} className={`w-[48px] absolute top-4 right-4 z-10 disabled:bg-red-500`} src={rightArrow} />
      <div
        className="flex w-screen transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)`}}
      >
        {
          activityArr.map(([dateString, activityArray]) => {
            
            return (
              <div
                key={dateString}
                className={`shrink-0 w-full text-black text-[24px] px-4`}
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
