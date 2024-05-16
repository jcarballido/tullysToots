import React from 'react'
import useAuth from '../hooks/useAuth'
import {axiosPrivate} from '../api/axios'
import { Link } from 'react-router-dom'

function AccountNavigation({ slide, setSlide }) {

  const { setAuth } = useAuth() 

  const handleClose = (e) => {
    e.preventDefault()
    setSlide(false)
  }
  const handleLogout = (e) => {
    e.preventDefault()
    axiosPrivate
      .get('/account/logout')
      .then( res => {
        console.log(res)
        return setAuth(prev => {return {...prev, accessToken:null, isLoggedIn:false}})
      }).catch( e => console.log(e))
  }

  return (
    <div className={`absolute h-full bg-amber-100 w-1/3 transition duration-150 ease-in left-full z-50 text-black ${slide ? '-translate-x-full':'translate-x-0'} flex flex-col items-start`} >
      <Link to='/dashboard'>DASHBOARD</Link>
      <button onClick={handleLogout}>LOGOUT</button>
      <button onClick={handleClose}>CLOSE</button>
    </div>
  )
}

export default AccountNavigation