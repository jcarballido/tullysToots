import React,{ useEffect, useState } from 'react'
import { Link, useActionData, useNavigate } from 'react-router-dom'
// Components import
import CredentialsModal from '../components/CredentialsModal'
import SignUpForm from '../components/SignUpForm'
import useAuth from '../hooks/useAuth'
import axios from 'axios'

const SignUp = () => {

  const { auth,setAuth } = useAuth()
  const authenticationData = useActionData()
  const navigate = useNavigate()

  useEffect(()=> {
    authenticationData?.accessToken? setAuth({ ...authenticationData }) : null
  },[authenticationData])

  useEffect(() => {
    auth?.accessToken ? navigate('activity') : null
  },[auth])

  return(
    <CredentialsModal>
      <div className='flex justify-center items-center my-4'>
          WELCOME!
      </div>
      <SignUpForm />
      <div className='flex justify-center items-center pr-1'>Already have an account?</div>
        <button>
            <Link to='/'>Sign in</Link>
        </button >
    </CredentialsModal>
  )
}

export const action = async ({ request }) => {
  const formData = await request.formData()
  const username = formData.get("username")
  const password = formData.get("password")
  const email = formData.get("email")
  const newOwnerData = { email, username, password }

  try{
    const response = await axios.post("http://localhost:3000/account/sign-in",newOwnerData)
    const accessToken = response.accessToken
    return { accessToken, isLoggedIn: true }
  } catch(e){
    console.log('SignUp action resulted in the following error: ',e)
    return null
  }
}

export default SignUp