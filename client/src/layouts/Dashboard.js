import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../tailwind.css';
import Banner from '../components/Banner.js'
import Footer from '../components/Footer.js'
import useAuth from '../hooks/useAuth.js';
// import { axiosPrivate } from '../api/axios.js';

export const Dashboard = () => {
  
  const { auth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const previousLocation = location.state?.from

  // const previousPathSplit = previousLocation.split('/')
  // const previousPageName = previousPathSplit[previousPathSplit.length - 1]
  // const previousPageNameCapitalized = previousPageName.charAt(0).toUpperCase() + previousPageName.slice(1)

  const sendBack = (e) => {
    e.preventDefault()
    navigate(-1)
  }
  
  return(
    <div className='max-w-screen h-screen bg-violet-800 flex flex-col justify-start items-center text-white overflow-x-hidden border-4 border-blue-700'>
      <Banner auth={auth} />
      <div className='w-full grow flex flex-col items-center  bg-gray-500 border-black'>
        {/* <button className='w-full grow-0 flex items-center' onClick={sendBack}>{`<= ${previousPageNameCapitalized}`}</button> */}
        <div className='grow w-full flex flex-col items-center'>
          <div className='flex items-center justify-center' >USERNAME</div>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}
