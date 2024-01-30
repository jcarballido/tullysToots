import React, { createContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const AuthContext = createContext({})

const AuthProvider = ({children}) => {

  const [ auth, setAuth ] = useState({default:'true'})

  console.log('Auth Provider auth variable set to =, ', auth)

  return(
    <AuthContext.Provider value={{ auth, setAuth }} >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }