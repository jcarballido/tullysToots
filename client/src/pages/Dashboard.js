import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
// Component imports
// import LoginForm from '../components/LoginForm.js'
// import CredentialsModal from '../components/CredentialsModal.js'

const Dashboard = () => {
  return(
    <div className='h-full w-full border-4 border-green-300'>
      <Link to='account'>Account</Link>
      <Link to='invite'>Invite</Link>
      <Link to='pets'>Pets</Link>
      <Outlet />
    </div>
  )
}

export default Dashboard