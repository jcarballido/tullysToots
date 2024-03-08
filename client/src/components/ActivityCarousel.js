import React, {  useEffect, useState } from 'react'
import ActivityCard from './ActivityCard'
import timestampParser from '../util/timestampParser.js'
import axios from '../api/axios.js';

const ActivityCarousel = ({ activity, setActivity, referencePetId, setReferencePetId, referenceDate, setReferenceDate }) => {

  const [ currentIndex, setCurrentIndex ] = useState(1);
  const [ presentReferenceDate, setPresentReferenceDate ] = useState(null)
  const [ data, setData ] = useState(null)

  useEffect( () => {
    const { fullYear, month, date } = timestampParser(new Date())
    if(referenceDate == `${fullYear}-${month+1}-${date}`) setPresentReferenceDate(true)
    else setPresentReferenceDate(false)
  })

  useEffect( () => {
    if(currentIndex == 0){
      // const fetchData = async() => {
      //   const response = await axios.post('/activity/getPastActivity',{referencePetId, referenceDate:new Date(referenceDate), daysOfActivity:3})
      //   const newActivity = response.data
      //   console.log("newActivity: ", newActivity)
      //   setActivity( (prevActivity) => {
      //     const rawActivity = structuredClone(prevActivity.rawActivity)
      //     console.log('rawActivity: ',rawActivity)
      //     rawActivity.unshift(...newActivity)
      //     console.log('rawActivity after unshift: ',rawActivity)
      //     const dateMap = new Map()
      //     const activityMap = new Map()
      //     rawActivity.forEach( date => {
      //       const [ dateString, activityArray ] = Object.entries(date)[0]
      //       if(activityArray.length == 0){
      //         dateMap.set(dateString, activityArray)
      //       }else{
      //         activityArray.forEach( loggedActivity => {
      //           const existingDateActivity = dateMap.get(dateString) || []
      //           existingDateActivity.push(loggedActivity.activity_id)
      //           dateMap.set(dateString, existingDateActivity)
      //           activityMap.set(loggedActivity.activity_id, loggedActivity)
      //         })
      //       }
      //     })
      //     console.log('dateMap: ',dateMap)
      //     console.log('activityMap: ', activityMap)
      //     return { activity:{dateMap, activityMap, rawActivity} }
      //   })
      //   setCurrentIndex(3)
      // }
      // fetchData()
      axios.post('/activity/getPastActivity',{referencePetId, referenceDate:new Date(referenceDate), daysOfActivity:3})
        .then( res => {
          const newActivity = res.data
          console.log("newActivity: ", newActivity)
          setActivity( (prevActivity) => {
            const rawActivity = structuredClone(prevActivity.rawActivity)
            console.log('rawActivity: ',rawActivity)
            rawActivity.unshift(...newActivity)
            console.log('rawActivity after unshift: ',rawActivity)
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
            console.log('dateMap: ',dateMap)
            console.log('activityMap: ', activityMap)
            return { activity:{dateMap, activityMap, rawActivity} }
          })
          setCurrentIndex(3)
        })

    }

  }, [currentIndex])

  useEffect( () => {
    const newAct = activity? Array.from(activity.dateMap) : null
    console.log('useEffect, newAct: ', newAct)
    setData(newAct)
  },[activity])

  console.log('activity state: ', activity)

  // useEffect(() => {
  //   setCurrentIndex(3)
  // },[activity])

  const nextCard = (e) => {
    e.preventDefault()
    setCurrentIndex((prevIndex) => prevIndex + 1);
    const entries = Array.from(activity.dateMap.entries())
    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex+1][0]
    setReferenceDate(activeReferenceDate)
    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
  };

  const prevCard = (e) => {
    e.preventDefault()
    setCurrentIndex((prevIndex) => prevIndex - 1)
    const entries = Array.from(activity.dateMap.entries())
    // entries = [ [date1,[id1]],[date2,[id2,id3]],... ]
    const activeReferenceDate = entries[currentIndex-1][0]
    setReferenceDate(activeReferenceDate)
    localStorage.setItem('referenceDate', JSON.stringify(activeReferenceDate))
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative ">
        <button onClick={prevCard} className="px-0 py-2 bg-blue-500 text-white absolute bottom-4 left-4 z-10">
          Previous
        </button>
        <button disabled={presentReferenceDate} onClick={nextCard} className={`px-0 py-2 bg-blue-500 text-white absolute bottom-4 right-4 z-10 disabled:bg-red-500`} >
          Next
        </button>
        <div
            className="flex w-screen transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)`}}
          >
            {data ? 
              data.map(([dateString, activityArray],index) => (
                <div
                  key={index}
                  className={`shrink-0 w-full h-48 border-[10px] border-yellow-400 text-black text-[24px] px-4`}
                >
                  <ActivityCard dateString={ dateString } activityArray={ activityArray } activityMap={activity.activityMap} />
                </div>
            ))
            : null
          }
            
        </div>
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
