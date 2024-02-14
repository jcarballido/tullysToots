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

  const { activity:referenceActivity, referenceDate:initialReferenceDate} = useLoaderData()
  const updatedActivity = useActionData()
  const [ activity, setActivity ] = useState(prev => [...referenceActivity])
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  useEffect( () => {
    //  NEED TO IDENTIFY WHAT ACTIVITY HAS CHANGED BY ACTIVITY ID, THEN FIND THAT INDEX AND APPLY THE CHANGES
    updatedActivity
    ? setActivity([ ...updatedActivity ])
    : null
  },[updatedActivity] )

  useEffect( () => {
    // Need to check if reference date currently exists in the 'activity' state. If so, only the reference date is updated. If the reference date reaches the furthest days in activity, then a get call needs to be made to get a new round of data and the 'activity' state must be updated.
  },[ referenceDate ])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>Tullys' Activity</div>
      <ActivityCarousel activity={activity} />
    </main>
  )
}

export default Activity

// When the Activity page loads, a request should be made to get any existing data based on the current date (and 7 days prior).
export const loader = () => {
  // returns a timestamp with local time zone of today's date.
  const referenceDate = localStorage.getItem('refDate') || new Date()
  const activity = 
    axios
    //DOUBLE CHECK SERVER PATH
    .post('/activity/get', { referenceDate })
    .then(res => {
      const data = res.data
      const historyWindow = 15 // days; 7 before and 7 after the reference date
      if(data.length == historyWindow) return data
      else {
        const filledData = [...data, ...Array(historyWindow-data.length).fill(null)]
        return filledData
      }
      //res.data structure:
      // Array of 'days'
      // Each day has activity data, based on time. Mupltiple 'activities' per day is possible.
      // EX:[ { date: [{},{},{}] } , { date:[{}] } , { date:[{},{}] }, ... ]
      // [ {enteredBy: 'name', timeStamp: Date, poo:true, pee:true}, {enteredBy: 'name', time: HH:MM TZ, poo:true, pee:true}]
      
    })
    .catch(e => {
      console.log(e)
      return null
    })
  return { activity, referenceDate }
}

export const action = ({ request }) => {

  const formData = request.formData()
  const activityId = formData.get('id')
  const date = formData.get('date')
  const time = formData.get('time')
  const activity = formData.get('activity')
  const user = formData.get('user')

  const confirmedChange = axios 
    .post('/activity/update',{ activityId, date, time, activity, user })
    .then( res => {
      return res.data
    })
    .catch( e => {return {error:'Change was unsucessful'}})
  
  return confirmedChange
}