import React, { useEffect, useState, useContext } from 'react'
import {
  useActionData,
  useLoaderData
} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ActivityCarousel from '../components/ActivityCarousel'
import PetSelector from '../components/PetSelector'
import axios from '../api/axios'
import timestampParser from '../util/timestampParser'


const Activity = () => {

  const { auth } = useAuth()

  const { activity:initialActivity, referenceDate:initialReferenceDate, referencePetId:initialPetId, petIdArray:initialPetIdArray } = useLoaderData()

  const [ activity, setActivity ] = useState(initialActivity)
  const [ dateMap, setDateMap ] = useState({})
  const [ activityMap, setActivityMap ] = useState({})
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)
  const [ petIdArray, setPetIdArray ] = useState(initialPetIdArray)

  // useEffect( () => {
  //   localStorage.setItem('referenceDate',referenceDate.toLocaleString().split(',')[0])
  //   localStorage.setItem('referencePetId', JSON.stringify(referencePetId))
  //   setMounted(true)
  // }, [] )

  // useEffect( () => {
  //   if(updatedActivity) {// updatedActivity: [ {...act1new},{...act2new},... ]
  //   // activity: {dateMap: [ date1 => [id1,...], date2 => [id2,id3,...],...], activityMap : [ id1 => {...activity1}, id2 => {...activity2}, ... ] } 
  //   const newActivityMap = new Map()
  //   updatedActivity.forEach( updatedActivity => {
  //     newActivityMap.set(updatedActivity.activity_id, updatedActivity)
  //   })

  //   setActivity( prev => {
  //     const updatedActivityMap = new Map()
  //     prev.activityMap.forEach( ( value, key ) => {
  //       if(newActivityMap.has(key)){
  //         updatedActivityMap.set(key, newActivityMap.get(key))
  //       }else{
  //         updatedActivityMap.set(key, value)
  //       }
  //     })
  //     return { dateMap:prev.dateMap, activityMap: updatedActivityMap} 
  //   })}

  // },[ updatedActivity ])

  useEffect( () => {
    const workingDateMap = new Map()
    const workingActivityMap = new Map()
    // activity = [ {date1: [{...act1},...]}, { date2: [ {...act2},...]} ]
    activity.forEach( date => {
      const [ dateString, activityArray ] = Object.entries(date)[0]
      if(activityArray.length == 0){
        workingDateMap.set(dateString, activityArray)
      }else{
        activityArray.forEach( loggedActivity => {
          const existingDateActivity = workingDateMap.get(dateString) || []
          existingDateActivity.push(loggedActivity.activity_id)
          workingDateMap.set(dateString, existingDateActivity)
          workingActivityMap.set(loggedActivity.activity_id, loggedActivity)
        })
      }
    })
    setDateMap(workingDateMap)
    setActivityMap(workingActivityMap)

  },[activity])

  useEffect( () => {
    setPetIdArray(initialPetIdArray)
  }, [])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      {/* <PetSelector petIdArray={petIdArray} /> */}
      <ActivityCarousel dateMap={dateMap} activityMap={activityMap} setActivity={setActivity} referencePetId={referencePetId} setReferencePetId={setReferencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} />
    </main>
  )
}

export default Activity

export const loader = async () => {
  // Get exisiting reference date from local storage or set to the current date
  let referenceDate = localStorage.getItem('referenceDate') || null
  if(!referenceDate){
    referenceDate = new Date()
    localStorage.setItem('referenceDate', referenceDate.toLocaleString().split(',')[0])
  }

  // Get exisiting reference pet ID from local storage or set to null
  let referencePetId = localStorage.getItem('referencePetId') || null

  // Extract the full year, month, and date from the reference date
  const { year, monthIndex, date } = timestampParser(referenceDate)
  const timeWindow = { daysBefore:7, daysAfter:7 }
  
  // Fetch activity for the reference date and pet ID
  try{
    const response = await axios
      .post('/activity/get', { referencePetId, referenceDate:`${year}-${monthIndex+1}-${date}`, timeWindow })

    // Extract the activity from the resoponse
    const rawActivity = response.data.activityArray

    // Extract the petId array from the response
    const petIdArray = response.data.petIdArray
  
    // If a singlePetId is present in the response, assign to the the referencePetId variable
    if(response.data.singlePetId){
      referencePetId = response.data.singlePetId
      localStorage.setItem('referencePetId', referencePetId)
    }

    return { activity:rawActivity, referenceDate, referencePetId, petIdArray }
  }catch(e){
    console.log(e)
    return e
  }

  // Return the activity, referenceDate, and referecenSinglePetId
}

