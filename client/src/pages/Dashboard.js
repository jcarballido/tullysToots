import React, { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Dashboard = () => {

  const navigate = useNavigate()
  const { username } = useAuth()

  const sendBack = (e) => {
    e.preventDefault
    navigate(-1)
  }

  return(
    <div className='h-full w-full border-4 border-green-300 flex flex-col items-center'>
      <button onClick={sendBack} className='w-full flex'>{'<= BACK'}</button>
      <div className='h-7/8 w-full flex flex-col'>
        {username}
        <Outlet />      
      </div>
    </div>
  )
}

export default Dashboard