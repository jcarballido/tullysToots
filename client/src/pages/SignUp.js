import React,{ useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
// Components import
import CredentialsModal from '../components/CredentialsModal'
import SignUpForm from '../components/SignUpForm'
import useAuth from '../hooks/useAuth'

const SignUp = () => {

  const { auth,setAuth } = useAuth()

  // Test automatic navigation 
  useEffect(()=> {
    
    },[])

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

export default SignUp