import React, {  useEffect, useState } from 'react'
import ActivityCard from './ActivityCard'
import timestampParser from '../util/timestampParser.js'
import axios from '../api/axios.js';

const ActivityCarousel = ({ dateMap, activityMap, setActivity, referencePetId, referenceDate, setReferenceDate }) => {

  const [ currentIndex, setCurrentIndex ] = useState(7);
  const [ presentReferenceDate, setPresentReferenceDate ] = useState(null)
  const [ dailyActivity, setDailyActivity ] = useState([])
  const [ today, setToday ] = useState(false)
  const [ yesterday, setYesterday ] = useState(false)

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
        const response = await axios.post('/activity/getPastActivity',{referencePetId, referenceDate:new Date(referenceDate), timeWindow})
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
    setDailyActivity(Array.from(dateMap))
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

  return (
    <div className="w-full flex items-center justify-center relative">
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
          {dailyActivity ? 
            dailyActivity.map(([dateString, activityArray],index) => {
              return (
                <div
                  key={dateString}
                  className={`shrink-0 w-full min-h-48 border-[10px] border-yellow-400 text-black text-[24px] px-4`}
                >
                  <ActivityCard dateString={ dateString } activityArray={ activityArray } activityMap={ activityMap } setActivity={ setActivity } referencePetId={referencePetId} />
                </div>
              )})
          : null
        }
          
      </div>
    </div>
  );
};

export default ActivityCarousel
/*
  const fetchData = async(referenceDate,referencePetId,activityObj,setActivity,setCurrentIndex) => {
    const response = await axios.post('/activity/getPastActivity', { referencePetId, referenceDate:new Date(referenceDate), daysOfActivity: 3 })
    const newActivity = response.data
    console.log('Line 43, Activity Carousel, raw activity: ', activityObj.rawActivity)
    console.log('Line 44, Activity Carousel, structured clone: ', structuredClone(activityObj.rawActivity))
    // newActivity = [ {date1old:[]}, {date2old:[]}, {date3old:[]} ]
    setActivity( (prevActivity) => {
      const rawActivity = structuredClone(prevActivity.rawActivity)
      console.log('Line 48, rawActivity:', rawActivity)
      rawActivity.unshift(...newActivity)
      console.log('Line 48, rawActivity with newly fetched activity:', rawActivity)
      const dateMap = new Map()
      const activityMap = new Map()
      rawActivity.forEach( date => {
        const [ dateString, activityArray ] = Object.entries(date)[0]
        if(activityArray.length == 0){
          dateMap.set(dateString, activityArray)
        }else{
          activityArray.forEach( loggedActivity => {
            const existingDateActivity = dateMap.get(dateString) || []
            existingDateActivity.push(loggedActivity.activity_id)
            dateMap.set(dateString, existingDateActivity)
            activityMap.set(loggedActivity.activity_id, loggedActivity)
          })
        }
      })
      return { activity:{dateMap, activityMap, rawActivity} }
    })
    
  }

  useEffect( () => {
    if(currentIndex == 0){
      try{
        fetchData(referenceDate,referencePetId,activity,setActivity,setCurrentIndex)
        setCurrentIndex(3)
      }catch(e){
        console.log('Line 52, Carousel: ',e)
      }
        
    }
  })
*/
