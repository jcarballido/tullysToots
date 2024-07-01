import React, { useState } from 'react'
import useAuth from '../hooks/useAuth'
// import {axiosPrivate} from '../api/axios'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
// import { axiosPrivate } from '../api/axios'
import Toast from './Toast'

function AccountNavigation({ slide, setSlide }) {
  const [ toast, setToast ] = useState({ visible:false,result:null,message:'' })

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
      setToast({ visible:true, result:'x', message: e.message })
    }
    
  }

  return (
    <div className={`absolute h-full bg-amber-100 w-1/3 transition duration-150 ease-in left-full z-50 text-black ${slide ? '-translate-x-full':'translate-x-0'} flex flex-col items-start`} >
      <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } />
      <Link to='/dashboard' state={{from:location.pathname}}>DASHBOARD</Link>
      <button onClick={handleLogout}>LOGOUT</button>
      <button onClick={handleClose}>CLOSE</button>
    </div>
  )
}

export default AccountNavigation