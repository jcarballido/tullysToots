import React, { useEffect, useContext } from 'react'
import {
  useActionData,
  useLoaderData
} from 'react-router-dom'
// import Pet from '../components/PetProfile'
import ActivityCarousel from '../components/ActivityCarousel'
import AuthContext from '../context/AuthContext'
import axios from 'axios'

const Activity = () => {

  const { activity:initialActivity, referenceDate:initialReferenceDate, referencePetId:initialPetId} = useLoaderData()
  const updatedActivity = useActionData()
  const [ activity, setActivity ] = useState(prev => [...initialActivity])
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)

  useEffect( () => {
    //  NEED TO IDENTIFY WHAT ACTIVITY HAS CHANGED BY ACTIVITY ID, THEN FIND THAT INDEX AND APPLY THE CHANGES
    updatedActivity
    ? setActivity([ ...updatedActivity ]) 
    : null
  },[updatedActivity] )

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]' referencePetId={ referencePetId } setReferencePetId={setReferencePetId} >Tullys' Activity</div>
      <ActivityCarousel activity={activity} referenceDate={referenceDate} setReferenceDate={setReferenceDate} />
    </main>
  )
}

export default Activity

// When the Activity page loads, a request should be made to get any existing data based on the current date (and 7 days prior).
export const loader = () => {
  // returns a timestamp with local time zone of today's date.
  const referenceDate = localStorage.getItem('referenceDate') || new Date()
  const referencePetId = localStorage.getItem('referencePetId') || null
  const activity = 
    axios
    //DOUBLE CHECK SERVER PATH
    .post('/activity/get', { referenceDate, referencePetId })
    .then(res => {
      return res.data
    })
    .catch(e => {
      console.log(e)
      return null
    })
  return { activity, referenceDate, referencePetId }
}

export const action = ({ request }) => {

  const formData = request.formData()
  const activityId = formData.get('id')
  const date = formData.get('date')
  const time = formData.get('time')
  const activity = formData.get('activity')
  const user = formData.get('user')
  const command = formData.get('command')

  if(command == 'add'){
    const confirmedAdd = 
    axios 
    .post('/activity/add',{ activityId, date, time, activity, user })
    .then( res => {
      return res.data
    })
    .catch( e => {return {error:'Change was unsucessful'}})
  
    return confirmedAdd
  }else if(command == 'update'){
    const confirmedChange = 
    axios 
    .post('/activity/update',{ activityId, date, time, activity, user })
    .then( res => {
      return res.data
    })
    .catch( e => {return {error:'Change was unsucessful'}})
  
    return confirmedChange
  }else{
    const confirmedDeletion = 
    axios 
    .post('/activity/delete',{ activityId, date, time, activity, user })
    .then( res => {
      return res.data
    })
    .catch( e => {return {error:'Change was unsucessful'}})
  
    return confirmedDeletion
  }
}