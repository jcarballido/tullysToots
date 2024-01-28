import React,{ useEffect, useState } from 'react'
// Components import
import CredentialsModal from '../components/CredentialsModal'
import SignUpForm from '../components/SignUpForm'
import useAuth from '../hooks/useAuth'

const SignUp = () => {

  const { auth } = useAuth()

  useEffect( () => {
    console.log('SignUp Auth result = ', auth)
  }, [auth])

  return(
    <CredentialsModal>
        <div className='flex justify-center items-center my-4'>
            WELCOME!
        </div>
        <SignUpForm />
        <div className='flex justify-center items-center pr-1'>Already have an account?</div>
          <button>
              <a href='/login'>Sign in</a>
          </button >
    </CredentialsModal>
  )
}

export default SignUp