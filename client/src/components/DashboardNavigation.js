import React from "react"
import { axiosPrivate } from "../api/axios"
import useAuth from "../hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import useAxiosPrivate from "../hooks/useAxiosPrivate"


const DashboardNavigation = () => {

  const { setAuth } = useAuth()
  const location = useLocation()
  const axiosPrivate = useAxiosPrivate()

  const handleLogout = async (e) => {
    e.preventDefault()
    try{
      await axiosPrivate.get('/account/logout')
      setAuth({ })
      localStorage.clear()
    }catch(e){
      console.log(e)
    }
  }

  return(
    <div className='flex flex-col w-full text-xl gap-2 pt-2'>
      <Link to='/account' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'>Account Info</Link>
      <Link to='/pets' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'>Pets</Link>
      <Link to='/sendInvite' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'> Share Pet Info </Link>
      <button onClick={handleLogout} className='w-full flex items-center mt-10'>Logout</button>
    </div>
  )
}

export default DashboardNavigation