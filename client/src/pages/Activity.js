import React, { useEffect, useState, useContext } from 'react'
import {
  useActionData,
  useLoaderData,
  useNavigate
} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ActivityCarousel from '../components/ActivityCarousel'
import PetSelector from '../components/PetSelector'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
// import timestampParser from '../util/timestampParser'
// import axios from 'axios'

const Activity = () => { 

  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const { referenceDate:initialReferenceDate, referencePetId:initialPetId } = useLoaderData() 

  const [ activity, setActivity ] = useState([])
  const [ dateMap, setDateMap ] = useState(new Map())
  const [ savedActivityMap, setSavedActivityMap ] = useState(new Map())
  const [ editableActivityMap, setEditableActivityMap ] = useState(new Map())
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)
  const [ petIdArray, setPetIdArray ] = useState([])

  useEffect( () => {
    const abortController = new AbortController()
    const getSinglePetId = async() => {
      try{
        // console.log('Reference Pet Id: ', referencePetId)
        const response = await axiosPrivate.get('/account/getSinglePetId',{ signal:abortController.signal })
        const fetchedPetId = response.data.singlePetId
        // console.log('Response: ', response)

        if(!fetchedPetId) return console.log('No existing pet links found')

        localStorage.setItem('referencePetId', JSON.stringify(fetchedPetId))
        return setReferencePetId(fetchedPetId)
      }catch(e){
        return console.log('Error getting single pet id: ',e)
      }
    }

    if(!referencePetId) getSinglePetId()

    return () => abortController.abort()
  },[])

  useEffect( () => {
    const abortController = new AbortController()

    const getActivity = async() => {
      const timeWindowObj = { daysBefore:3, daysAfter:3 }
      const parameters = {
        referencePetId: referencePetId, 
        referenceDate, 
        timeWindowObj
      }
      const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
      // Fetch activity for the reference date and pet ID
      try{
        const response = await axiosPrivate.get(`/activity/get?data=${encodedParameters}`,{ signal:abortController.signal })
        if(response.status == 204) return console.log('No actively linked pets.')
        const { rawActivity, responsePetIdArray } = response.data 
        setActivity(rawActivity)
        setPetIdArray(responsePetIdArray)
        return 
      }catch(e){
        console.log('Error from attempting to get data with encoded parameters: ',e)
        return e
      }
    }
    if(referencePetId){
      getActivity()
    }
    return () => abortController.abort()

  },[referencePetId])

  useEffect( () => {
    const workingDateMap = new Map()
    const workingActivityMap = new Map()
    // activity = [ {date1: [{...act1},...]}, { date2: [ {...act2},...]} ]
    if(activity?.length > 0){
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
      }})
      setDateMap(workingDateMap)
      setSavedActivityMap(workingActivityMap)
      setEditableActivityMap(workingActivityMap)
    }
    
  },[activity])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center overflow-hidden'>
      {/* <button className='rounded-2xl bg-gray-400 border-black border-2' onClick={sendAxiosRequest} >TEST AXIOS INTERCEPTOR</button> */}
      <PetSelector petIdArray={petIdArray} referencePetId={referencePetId} setReferencePetId={ setReferencePetId } />
      {
        referencePetId
        ? <ActivityCarousel dateMap={dateMap} savedActivityMap={savedActivityMap} editableActivityMap={editableActivityMap} setEditableActivityMap={setEditableActivityMap} setActivity=    {setActivity} referencePetId={referencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} activity={activity} />
        : <div>Add a new pet!</div>
      }
      <button onClick={() => navigate('/acceptInvite')}>Accept Invitation</button>    
    </main>
  )
}

export default Activity

export const loader = () => {
  // Get exisiting reference date from local storage or set to the current date
  let referenceDate = localStorage.getItem('referenceDate') || null
  if(!referenceDate){
    referenceDate = new Date()
    localStorage.setItem('referenceDate', JSON.stringify(referenceDate.toLocaleString().split(',')[0]))
  }

  // Get exisiting reference pet ID from local storage or set to null
  const referencePetIdLocalStorage = localStorage.getItem('referencePetId') || null
  console.log('Reference pet id in local storage type of: ', typeof(referencePetIdLocalStorage))
  const referencePetId = referencePetIdLocalStorage == 'undefined' || referencePetIdLocalStorage == 'null'  ? null : JSON.parse(referencePetIdLocalStorage)  

  return { referenceDate, referencePetId}
}

