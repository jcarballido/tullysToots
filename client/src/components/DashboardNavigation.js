import React from "react"
import { axiosPrivate } from "../api/axios"
import useAuth from "../hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import useAxiosPrivate from "../hooks/useAxiosPrivate"
import account from '../media/avatar.svg'
import dog from '../media/dog.svg'
import share from '../media/share.svg'
import accept from '../media/accept.svg'
import logout from '../media/logout.svg'

const DashLink = ({ imageSource, destination, tag }) => {

  const location = useLocation()

  return(
    <Link to={destination} state={{ from: location.pathname }} className='max-w-max flex gap-4 h-[48px] items-center '>
      <img src={imageSource} className="flex items-center justify-center h-4/6"/>
      {tag}
    </Link>
  )
}

const DashboardNavigation = () => {

  const { setAuth } = useAuth()
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
    <div className='flex flex-col w-full text-xl  gap-2 pt-2 items-start'>
      <DashLink imageSource={account} destination={'/account'} tag='Update Account' />
      <DashLink imageSource={dog} destination={'/pets'} tag='Pets' />
      <DashLink imageSource={share} destination={'/sendInvite'} tag='Share Pet Info' />
      <DashLink imageSource={accept} destination={'/acceptInvite'} tag='Accept Invite' />
      {/* <Link to='/account' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'>
        <img src={account} className="flex items-center justify-center h-4/6"/>
        Update Account
      </Link> */}
      {/* <label className="flex gap-4 h-[48px] items-center justify-center">
        <img src={dog} className="flex items-center justify-center h-4/6"/>
        <Link to='/pets' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'>Pets</Link>
      </label>
      <label className="flex gap-4 h-[48px] items-center justify-center">
        <img src={share} className="flex items-center justify-center h-4/6"/>
        <Link to='/sendInvite' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'> Share Pet Info </Link>
      </label>
      <label className="flex gap-4 h-[48px] items-center justify-center">
        <img src={accept} className="flex items-center justify-center h-4/6"/>
        <Link to='/acceptInvite' state={{ from: location.pathname }} className='w-full flex items-center h-[48px]'>Accept Invite</Link>
      </label> */}
      <label className="flex gap-4 h-[48px] items-center justify-center mt-8">
        <img src={logout} className="flex items-center justify-center h-4/6"/>
        <button onClick={handleLogout} className='w-full flex items-center '>Logout</button>
      </label>
    </div>
  )
}

export default DashboardNavigation