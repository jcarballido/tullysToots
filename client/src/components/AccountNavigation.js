import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'
// import {axiosPrivate} from '../api/axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
// import { axiosPrivate } from '../api/axios'
import Toast from './Toast'

function AccountNavigation({ slide, setSlide }) {

  const location = useLocation()
  const navigate = useNavigate()

  const { auth,setAuth } = useAuth() 
  const axiosPrivate = useAxiosPrivate()

  const handleClose = (e) => {
    e.preventDefault()
    setSlide(false)
  }
  const handleLogout = async(e) => {
    e.preventDefault()
    try{
      // console.log('Auth read in Account Navigation: ', auth)
      await axiosPrivate.get('/account/logout')
      setAuth({})
      setSlide(false)
      localStorage.clear()
      // return navigate('/')
      return
    }catch(e){
      console.log('Error sending logout request: ',e)
    }
  }

  return (
    <div className={`absolute h-full inset-0 z-50 transition transform duration-150 origin-bottom backdrop-grayscale backdrop-blur-sm ${slide ? 'scale-y-100':'scale-y-0' }`} onClick={handleClose}>
      <div className={`absolute min-h-max bg-primary font-Lato min-w-full transition duration-150 ease-in top-full z-50 text-black ${slide ? '-translate-y-full':'translate-y-0'} flex flex-col items-center justify-center gap-10 text-2xl pb-4 shadow-lg rounded-t-2xl`} onClick={(e) => e.stopPropagation()} >
        <button onClick={handleClose} className='w-full flex flex-col justify-end items-start pr-2'>
          <div className='flex justify-end items-center w-full'>
            <div className=' flex justify-center items-center font-bold p-1 rounded-xl'>X</div>
          </div>
        </button>
        <Link to='/dashboard' state={{from:location.pathname}} className='px-4 h-[48px] font-bold text-white flex justify-center items-center bg-accent rounded-2xl'>Dashboard</Link>
        <button onClick={handleLogout} className='px-4 h-[48px] flex justify-center items-center text-white bg-red-500 rounded-2xl'>Logout</button>
      </div>
    </div>
  )
}

export default AccountNavigation