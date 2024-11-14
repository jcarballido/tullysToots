import React, { createContext, useState } from 'react'
import { Outlet } from 'react-router-dom'

const AuthContext = createContext({})

const AuthProvider = ({children}) => {

  const [ auth, setAuth ] = useState({})
  const [ username, setUsername ] = useState('')

  return(
    <AuthContext.Provider value={{ auth, setAuth, username, setUsername }} >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }