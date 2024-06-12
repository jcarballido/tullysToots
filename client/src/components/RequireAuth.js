import React, { useContext } from 'react'
import { Outlet, Navigate, useLocation, useOutletContext, useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

const RequireAuth = () => {
  
  const location = useLocation()
  const { auth } = useAuth()
  const [ searchParams ] = useSearchParams()

  const invitationToken = searchParams.get("invite")
  // const link = `/acceptInvite?invite=${invitationToken}`

  console.log('Auth read in RequireAuth: ', auth)

  return(
      auth?.isLoggedIn
        ? <Outlet />
        : <Navigate to={`/`} state={{from: location}} replace />
    
  )
}

export default RequireAuth
