import React, {  useEffect, useRef, useState } from 'react'
import ActivityCard from './ActivityCard'
// import timestampParser from '../util/timestampParser.js'
import getDateCharacteristics from '../util/getDateCharacteristics.js';
import useAxiosPrivate from '../hooks/useAxiosPrivate.js';
import TimeModal from './TimeModal.js';
import ConfirmationModal from './ConfirmationModal.js'
import leftArrow from '../media/left_arrow.svg' 
import rightArrow from '../media/right_arrow.svg' 

const ActivityCarousel = ({ dateMap, savedActivityMap, editableActivityMap, setEditableActivityMap, setActivity, referencePetId, referenceDate, setReferenceDate, activity, confirmationModal, setConfirmationModal, deleteExistingActivity }) => {

  const axiosPrivate = useAxiosPrivate()
  const [ currentIndex, setCurrentIndex ] = useState();
  const [ today, setToday ] = useState(false)
  const [ timeModal, setTimeModal ] = useState({visible:false,new:false, recordId:null,time:''})
  const currentReferencePetId = useRef(null)
  const [ status, setStatus ] = useState({ viewing: true, adding: true, updating: true })

  const activityArr = Array.from(dateMap)

  const fetchAdditionalData = async(timeWindowObj) => {

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
        // console.log('Prior history requested.')
        setActivity( (prevActivity) => {
          const rawActivity = structuredClone(prevActivity)
          // console.log('raw activity before updates:', rawActivity)
          rawActivity.unshift(...newActivity)
          // console.log('raw activity after updates:', rawActivity)
          // console.log('*Raw activity* : ', rawActivity)
          return rawActivity
        })
      }else{
        setActivity( (prevActivity) => {
          const rawActivity = structuredClone(prevActivity)
          rawActivity.push(...newActivity)
          return rawActivity
        })
      }
    }catch(e){
      console.log('*Activity Card* Error caught trying to fetch more activity cards:', e)
    }
  }

  useEffect(() => {
    console.log('Current index after initial render:', currentIndex)
    if(currentIndex == null || undefined){
      const mapKeys = dateMap.keys()
      const mapKeysArray = Array.from(mapKeys)
      const index = mapKeysArray.indexOf(referenceDate)
      if(index != -1) setCurrentIndex(index)
      else{
        console.log('Did not find reference date in updated dateMap. Reference date/dateMap: ', referenceDate,'/', dateMap)
        setCurrentIndex(3)
      }
    }
  }, [])

  useEffect( () => {
    const { isToday } = getDateCharacteristics(referenceDate)
    setToday(isToday)
  },[referenceDate])

  useEffect(() => {
    if(referencePetId && currentReferencePetId.current == null) {
      currentReferencePetId.current = referencePetId
    }
  }, [referencePetId])


  useEffect( () => {
    if(currentIndex == 0){
      fetchAdditionalData({ daysBefore:3, daysAfter:0 })
    }else if(currentIndex == activityArr.length - 1){
      fetchAdditionalData({ daysBefore:0, daysAfter:3 })
    }
  }, [currentIndex])

  useEffect( () =>{
    // console.log('Current index after dateMap changes:', currentIndex)
    if(currentReferencePetId.current == referencePetId && (currentIndex == 0 || currentIndex == activityArr.length - 1)){
      console.log('current ref matches pet ID in state' )
      const mapKeys = dateMap.keys()
      console.log('mapKeys:', mapKeys)
      const mapKeysArray = Array.from(mapKeys)
      const index = mapKeysArray.indexOf(referenceDate)
      console.log('index:', index)
      if(index != -1) setCurrentIndex(index)
      else console.log('Did not find reference date in updated dateMap. Reference date/dateMap: ', referenceDate,'/', dateMap)
    } 
    if(currentReferencePetId.current != referencePetId){
      console.log("pet change!")
      console.log('dateMap:', dateMap)
      const mapKeys = dateMap.keys()
      const mapKeysArray = Array.from(mapKeys)
      const index = mapKeysArray.indexOf(referenceDate)
      console.log('index:', index)
      if(index != -1) setCurrentIndex(index)
      else console.log('Did not find reference date in updated dateMap. Reference date/dateMap: ', referenceDate,'/', dateMap)
      currentReferencePetId.current = referencePetId
    }
    return 
  },[ dateMap ])

  const nextCard = (e) => {
    e.preventDefault()
    if(today) return
    setCurrentIndex((prevIndex) => prevIndex + 1);
    const entries = Array.from(dateMap.entries())
    // console.log('Entries:', entries)

    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex+1][0]
    setReferenceDate(activeReferenceDate)
    console.log('activeReferenceDate:', activeReferenceDate)

    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
    setStatus({ viewing:true, adding:false, updating:false })
  };

  const prevCard = (e) => {
    e.preventDefault()
    setCurrentIndex((prevIndex) => prevIndex - 1)
    const entries = Array.from(dateMap.entries())
    // console.log('Entries:', entries)
    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex-1][0]
    // console.log('activeReferenceDate:', activeReferenceDate)
    setReferenceDate(activeReferenceDate)
    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
    setStatus({ viewing:true, adding:false, updating:false })

  };

  // const updateActivtyMap = (e, activityId) => {
  //   e.preventDefault()
  //   setEditableActivityMap(/* use activityId to update activity map */)
  // }
  


  return (
    <div className="w-11/12 flex items-start justify-center relative overflow-x-hidden rounded-xl">
      <TimeModal timeModal={ timeModal } setTimeModal={setTimeModal} setEditableActivityMap={ setEditableActivityMap } />
      {/* <ConfirmationModal confirmationModal={confirmationModal} setConfirmationModal={setConfirmationModal} deleteExistingActivity={deleteExistingActivity}/>  */}
      <img onClick={prevCard} className="absolute top-4 left-4 z-10 w-[48px]" src={leftArrow} />
      <img onClick={nextCard} className={`w-[48px] absolute top-4 right-4 z-10 disabled:bg-red-500`} src={rightArrow} />
      <div
        className="flex w-screen transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)`}}
      >
        { 
          activityArr.map(([dateString, activityArray], index) => {
            return (
              <div
                key={dateString}
                className={`shrink-0 w-full text-black text-[24px] px-4`}
              >
                <ActivityCard dateString={ dateString } activityArray={ activityArray } editableActivityMap={editableActivityMap} setEditableActivityMap={setEditableActivityMap} savedActivityMap={ savedActivityMap } setActivity={ setActivity } referencePetId={referencePetId} setTimeModal={setTimeModal} setConfirmationModal={setConfirmationModal} activity={activity} setCurrentIndex={setCurrentIndex} current={currentIndex == index} status={status} setStatus={setStatus} confirmationModal={confirmationModal}  deleteExistingActivity={deleteExistingActivity} />
              </div>
            )
          })
        }   
      </div>
    </div>
  );
};

export default ActivityCarousel
