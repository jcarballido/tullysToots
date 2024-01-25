import React, { useEffect } from 'react'
// import Pet from '../components/PetProfile'
import ActivityCarousel from '../components/ActivityCarousel'

const Activity = () => {
  
  // use React Router Data hook to fetch for activity
  useEffect(()=>{

  },[ownerId])

  return(
    <main className='w-full border-2 border-green-700 mt-4 flex flex-col justify-start items-center'>
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>Tullys' Activity</div>
      <ActivityCarousel />
    </main>
  )
}

export default Activity