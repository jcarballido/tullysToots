import React, { useEffect, useState, useContext } from 'react'
import {
  useActionData,
  useLoaderData
} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ActivityCarousel from '../components/ActivityCarousel'
import PetSelector from '../components/PetSelector'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import timestampParser from '../util/timestampParser'

const Activity = () => {

  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()

  const { referenceDate:initialReferenceDate, referencePetId:initialPetId } = useLoaderData()

  const [ activity, setActivity ] = useState({})
  const [ dateMap, setDateMap ] = useState({})
  const [ activityMap, setActivityMap ] = useState({})
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)
  const [ petIdArray, setPetIdArray ] = useState([])

  useEffect( () => {
    const getActivity = async() => {
      const timeWindow = { daysBefore:7, daysAfter:7 }
      const parameters = {
        referencePetId:JSON.stringify(referencePetId), 
        referenceDate, 
        timeWindow
      }
      const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
      // Fetch activity for the reference date and pet ID
      try{
        const response = await axiosPrivate.get(`/activity/get?data=${encodedParameters}`)
        // Extract the activity from the resoponse
        const rawActivity = response.data.activityArray
        console.log(rawActivity)

        // Extract the petId array from the response
        const responsePetIdArray = response.data.petIdArray        

        setActivity(rawActivity)
        setPetIdArray(responsePetIdArray)
        return 
      }catch(e){
        console.log(e)
        return e
      }

    }
    const getSinglePetId = async() => {
      try{
        const response = await axiosPrivate.get('/account/getSinglePetId')
        setReferencePetId(response.data.singlePetId)
      }catch(e){
        console.log(e)
      }
    }
    if(!referencePetId){
      console.log('Null reference pet Id detected, making call to back end to retrieve one and set state')
      getSinglePetId()
    }else{
      console.log('ReferencePetId detected, set state to: ', referencePetId)
      getActivity()
      localStorage.setItem('referencePetId', JSON.stringify(referencePetId))
    }
  },[referencePetId])

  useEffect( () => {
    const workingDateMap = new Map()
    const workingActivityMap = new Map()
    // activity = [ {date1: [{...act1},...]}, { date2: [ {...act2},...]} ]
    if(Object.keys(activity).length > 0){
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
    })}
    setDateMap(workingDateMap)
    setActivityMap(workingActivityMap)

  },[activity])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center overflow-hidden'>
      {/* <button className='rounded-2xl bg-gray-400 border-black border-2' onClick={sendAxiosRequest} >TEST AXIOS INTERCEPTOR</button> */}
      <PetSelector petIdArray={petIdArray} referencePetId={referencePetId} setReferencePetId={ setReferencePetId } />
      <ActivityCarousel dateMap={dateMap} activityMap={activityMap} setActivity={setActivity} referencePetId={referencePetId} setReferencePetId={setReferencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} />
    </main>
  )
}

export default Activity

export const loader = async() => {
  // Get exisiting reference date from local storage or set to the current date
  let referenceDate = localStorage.getItem('referenceDate') || null
  if(!referenceDate){
    referenceDate = new Date()
    localStorage.setItem('referenceDate', JSON.stringify(referenceDate.toLocaleString().split(',')[0]))
  }

  // Get exisiting reference pet ID from local storage or set to null
  const referencePetId = JSON.parse(localStorage.getItem('referencePetId')) || null  
  // if(!referencePetId) {
  //   const response = await axios
  //         .post('/activity/getSinglePetId', { referencePetId, referenceDate, timeWindow },{ headers: {authorization:auth.accessToken}})
  // }

  return { referenceDate, referencePetId}
}

