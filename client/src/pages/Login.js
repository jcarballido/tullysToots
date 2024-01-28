import React, { useEffect, useState, useContext } from 'react'
import AuthContext from '../context/AuthContext.js'
// Component imports
import LoginForm from '../components/LoginForm.js'
import CredentialsModal from '../components/CredentialsModal.js'
import useAuth from '../hooks/useAuth.js'
import { useNavigate, useOutletContext } from 'react-router-dom'

const Login = () => {

  // console.log('Login component has mounted')

  const {auth, setAuth} = useAuth()
  const nav = useNavigate()

  useEffect( () => {
    // console.log('useEffect ran, and set Auth to some truthy value')
    setAuth({ isLoggedIn:true})
  },[])

  console.log('Auth @ Login Page = ', auth)

  return(
    <CredentialsModal>
        <div className='flex justify-center items-center my-4'>
            LOGIN
        </div>
        <button onClick={() => nav('/activity')} >go to activity</button>
        <LoginForm />
        <div className='flex justify-center items-center my-4'>
          <div className='flex justify-center items-center mr-1'>New to Tully's Toots?</div>
          <button className='min-w-[44px] min-h-[44px]'>
              <a href='/signup' className='flex justify-center items-center pl-1'>Create an account</a>
          </button >
        </div>
    </CredentialsModal>
  )
}

export default Login