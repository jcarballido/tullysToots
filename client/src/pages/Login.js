import React, { useEffect, useState, useContext } from 'react'
import AuthContext from '../context/AuthContext.js'
// Component imports
import LoginForm from '../components/LoginForm.js'
import CredentialsModal from '../components/CredentialsModal.js'
import useAuth from '../hooks/useAuth.js'
import { useNavigate, useOutletContext, Link,useActionData } from 'react-router-dom'
import axios from 'axios'

const Login = () => {

  const {auth, setAuth} = useAuth()
  const navigate = useNavigate()
  const action = useActionData()
  console.log('Action data from useActionData hook = ',action)

  // Check to see if user is currently logged in
  useEffect(() => {
    // console.log('Action data from useActionData hook = ',action)
    auth?.isLoggedIn? navigate('activity'): null

    
  }, [auth])

  return(
    <CredentialsModal>
        <div className='flex justify-center items-center my-4'>
            LOGIN
        </div>
        <LoginForm />
        <div className='flex justify-center items-center my-4'>
          <div className='flex justify-center items-center mr-1'>New to Tully's Toots?</div>
          <button className='min-w-[44px] min-h-[44px]'>
              <Link to='/signup' className='flex justify-center items-center pl-1'>Create an account</Link>
          </button >
        </div>
    </CredentialsModal>
  )
}

export const action = async ({ request }) => {
  // Validate form
  // ** Need **
  // Parse request for username and password
  const formData = await request.formData()
  const credentials = { username: formData.get("username"), password: formData.get("password")}
  // Send to backend for verification; Expect to get back an access token or an access token and an invitation token
  // ** NEED: Save accessToken in localStorage (or some alternative), then have the context provider grab it and use it in your app.
  let testData
  const data = axios.post('http://localhost:3000/test', credentials)
    .then(res => {
      console.log(res)
      testData = res.data
     
    })
    .catch(e => null)
  
  // Return the response and 
  return null 

  
} 

export default Login