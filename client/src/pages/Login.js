import React, { useState } from 'react'
// Component imports
import LoginForm from '../components/LoginForm.js'
import CredentialsModal from '../components/CredentialsModal.js'

const Login = () => {
  return(
    <CredentialsModal>
        <div className='flex justify-center items-center my-4'>
            LOGIN
        </div>
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