import React, { useEffect, useState, useContext } from 'react'
import {
  useActionData,
  useLoaderData
} from 'react-router-dom'
import ActivityCarousel from '../components/ActivityCarousel'
import axios from '../api/axios'

const Activity = () => {

  const { activity:initialActivity, referenceDate:initialReferenceDate, referencePetId:initialPetId} = useLoaderData()

  const updatedActivity = useActionData()

  const [ activity, setActivity ] = useState(initialActivity)
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)

  // useEffect( () => {
  //   localStorage.setItem('referenceDate',referenceDate.toLocaleString().split(',')[0])
  //   localStorage.setItem('referencePetId', JSON.stringify(referencePetId))
  //   setMounted(true)
  // }, [] )

  useEffect( () => {
    if(updatedActivity) {// updatedActivity: [ {...act1new},{...act2new},... ]
    // activity: {dateMap: [ date1 => [id1,...], date2 => [id2,id3,...],...], activityMap : [ id1 => {...activity1}, id2 => {...activity2}, ... ] } 
    const newActivityMap = new Map()
    updatedActivity.forEach( updatedActivity => {
      newActivityMap.set(updatedActivity.activity_id, updatedActivity)
    })

    setActivity( prev => {
      const updatedActivityMap = new Map()
      prev.activityMap.forEach( ( value, key ) => {
        if(newActivityMap.has(key)){
          updatedActivityMap.set(key, newActivityMap.get(key))
        }else{
          updatedActivityMap.set(key, value)
        }
      })
      return { dateMap:prev.dateMap, activityMap: updatedActivityMap} 
    })}

  },[ updatedActivity ])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>Tullys' Activity</div>
      <ActivityCarousel activity={activity} setActivity={setActivity} referencePetId={referencePetId} setReferencePetId={setReferencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} />
    </main>
  )
}

export default Activity

// When the Activity page loads, a request should be made to get any existing data based on the current date (and 7 days prior).
export const loader = async () => {
  // returns a timestamp with local time zone of today's date.
  // const referenceDate = localStorage.getItem('referenceDate') || new Date()
  let referenceDate

  if(localStorage.getItem('referenceDate') ){
    referenceDate = localStorage.getItem('referenceDate')
  }else{
    referenceDate = new Date()
    localStorage.setItem('referenceDate', referenceDate.toLocaleString().split(',')[0])
  }

  let referencePetId

  if(localStorage.getItem('referencePetId') ){
    referencePetId = localStorage.getItem('referencePetId')
  }else{
    referencePetId = null
  }

  const timestampParser = (timestampNumber) => {
    const convertedDate = new Date(timestampNumber)
    const fullYear = convertedDate.getFullYear()
    const month = convertedDate.getMonth()
    const date = convertedDate.getDate()
    return { fullYear,month,date }
  }
  const { fullYear, month, date } = timestampParser(referenceDate)
  // let referencePetId = localStorage.getItem('referencePetId')
  const response = await axios
    .post('/activity/get', { referenceDate:`${fullYear}-${month+1}-${date}`, referencePetId })
  const rawActivity = response.data.activityArray || response.data
  if(response.data.singlePetId){
    referencePetId = response.data.singlePetId
    localStorage.setItem('referencePetId', referencePetId)
  }

  const dateMap = new Map()
  const activityMap = new Map()
  if(rawActivity){
    // rawActivity = [ {date1: [{...act1},...]}, { date2: [ {...act2},...]} ]
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
  }

  return { activity:{ dateMap,activityMap,rawActivity }, referenceDate, referencePetId }
}

export const action = ({ request }) => {

  const formData = request.formData()
  const activityId = formData.get('id')
  const date = formData.get('date')
  const time = formData.get('time')
  const activity = formData.get('activity')
  const user = formData.get('user')
  const command = formData.get('command')

  const submissionResponse = axios
    .post(`/activity/${command}`, { activityId, date, time, activity, user })
    .then( res => {
      return res.data
    })
    .catch( e => {return {error:'Change was unsucessful'}} )

  return submissionResponse
}