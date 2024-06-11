import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../tailwind.css';
import Banner from '../components/Banner.js'
import Footer from '../components/Footer.js'
import useAuth from '../hooks/useAuth.js';
// import { axiosPrivate } from '../api/axios.js';

export const Dashboard = () => {

  console.log('Dashboard layout mounted')
  
  const [ previousLocation, setPreviousLocation ] = useState('')

  const { auth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  // const previousLocation = location.state?.from
  // console.log('Previous location: ', previousLocation)

  // const previousPathSplit = previousLocation.split('/')
  
  const sendBack = (e) => {
    e.preventDefault()
    navigate(-1)
  }

  useEffect( () => {
    console.log('Current location: ', location)
    if(location?.state?.from){
      console.log('Dashboard Layout/ useEffect ran and detected a location with state.from property: ', location.state.from)
      const previousLocationFilePath = location.state.from
      const previousLocationFilePathSplit = previousLocationFilePath.split('/')
      const previousPageName = previousLocationFilePathSplit[previousLocationFilePathSplit.length - 1] || null
      const previousPageNameCapitalized = previousPageName.charAt(0).toUpperCase() + previousPageName.slice(1)
      setPreviousLocation(previousPageNameCapitalized)
    }
    // else{
    //   console.log('Dashboard Layout/ useEffect ran and DID NOT detect a location with state.from property')
    //   setPreviousLocation('Account')
    // }
  },[location])
  
  return(
    <div className='max-w-screen h-screen bg-violet-800 flex flex-col justify-start items-center text-white overflow-x-hidden border-4 border-blue-700 relative'>
      <Banner auth={auth} />
      <div className='w-full grow flex flex-col items-center  bg-gray-500 border-black'>
        {
          previousLocation
          ? <button className='w-full grow-0 flex items-center' onClick={sendBack}>{`<= ${previousLocation}`}</button>
          : null  
        }
        <div className='grow w-full flex flex-col items-center'>
          <div className='flex items-center justify-center' >USERNAME</div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}
