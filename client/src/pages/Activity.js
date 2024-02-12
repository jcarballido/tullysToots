import React, { useEffect, useContext } from 'react'
// import Pet from '../components/PetProfile'
import ActivityCarousel from '../components/ActivityCarousel'
import AuthContext from '../context/AuthContext'
import axios from 'axios'

const Activity = () => {
  
  // use React Router Data hook to fetch for activity
  // useEffect(()=>{

  // },[ownerId])

  // console.log('Activity has mounted. Auth set to...', auth)

  useEffect(() => {
    const test = axios  
      .get('/account/activityTest', { withCredentials:true })
      .then( res => {
        console.log(res)
      }).catch( e => console.log(e))
  },[])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>Tullys' Activity</div>
      <ActivityCarousel />
    </main>
  )
}

export default Activity