import React, { useContext } from 'react'
import { Outlet, Navigate, useLocation, useOutletContext } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const RequireAuth = () => {
  
  const location = useLocation()
  const { auth } = useAuth()


  return(
    auth?.isLoggedIn
    ? <Outlet />
    : <Navigate to='/' state={{from: location}} replace />
  )
}

export default RequireAuth