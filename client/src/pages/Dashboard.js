import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
// Component imports
// import LoginForm from '../components/LoginForm.js'
// import CredentialsModal from '../components/CredentialsModal.js'

const Dashboard = () => {
  return(
    <div>
      <Outlet />
    </div>
  )
}

export default Dashboard