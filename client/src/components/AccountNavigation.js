import React from 'react'
import useAuth from '../hooks/useAuth'
// import {axiosPrivate} from '../api/axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
// import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { axiosPrivate } from '../api/axios'

function AccountNavigation({ slide, setSlide }) {
  const location = useLocation()
  const navigate = useNavigate()

  const { setAuth } = useAuth() 
  // const axiosPrivate = useAxiosPrivate()

  const handleClose = (e) => {
    e.preventDefault()
    setSlide(false)
  }
  const handleLogout = async(e) => {
    e.preventDefault()
    try{
      await axiosPrivate.get('/account/logout')
      return setAuth({})
      // navigate('/')
    }catch(e){
      console.log('Error sending logout request')
      console.log(e)
    }
  }

  return (
    <div className={`absolute h-full bg-amber-100 w-1/3 transition duration-150 ease-in left-full z-50 text-black ${slide ? '-translate-x-full':'translate-x-0'} flex flex-col items-start`} >
      <Link to='/dashboard' state={{from:location.pathname}}>DASHBOARD</Link>
      <button onClick={handleLogout}>LOGOUT</button>
      <button onClick={handleClose}>CLOSE</button>
    </div>
  )
}

export default AccountNavigation