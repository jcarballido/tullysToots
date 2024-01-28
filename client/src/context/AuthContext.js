import React, { createContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const AuthContext = createContext({})

export const AuthProvider = ({children}) => {

  const [ auth, setAuth ] = useState({default:'true'})

  console.log('Auth Provider auth variable set to =, ', auth)

  return(
    <AuthContext.Provider value={{ auth, setAuth }} >
      <Outlet />
    </AuthContext.Provider>
  )
}

export default AuthContext