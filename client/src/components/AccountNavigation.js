import React from 'react'
import useAuth from '../hooks/useAuth'
import axios from '../api/axios'

function AccountNavigation({ slide, setSlide }) {

  const { auth, setAuth } = useAuth() 

  const handleClose = (e) => {
    e.preventDefault()
    setSlide(false)
  }
  const handleLogout = (e) => {
    e.preventDefault()
    axios
      .get('/account/logout')
      .then( res => {
        console.log(res)
        return setAuth(prev => {return {...prev, isLoggedIn:false}})
      }).catch( e => console.log(e))
  }

  return (
    <div className={`absolute h-full bg-amber-100 w-1/3 transition duration-150 ease-in left-full z-50 text-black ${slide ? '-translate-x-full':'translate-x-0'}`} >
      AccountNavigation
      <button onClick={handleLogout}>LOGOUT</button>
      <button onClick={handleClose}>CLOSE</button>
    </div>
  )
}

export default AccountNavigation