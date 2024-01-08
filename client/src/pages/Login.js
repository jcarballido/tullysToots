import React, { useState } from 'react'
// Component imports
import LoginForm from '../components/LoginForm.js'
import CredentialsModal from '../components/CredentialsModal.js'

const Login = () => {
  return(
    <CredentialsModal>
        <div className='flex justify-center items-center mb-4'>
            LOGIN
        </div>
        <LoginForm />
        <div className='flex justify-center items-center'>
          <div className='flex justify-center items-center mr-1'>New to Tully's Toots?</div>
          <button className=''>
              <a href='/signup' className='flex justify-center items-center ml-1'>Create an account</a>
          </button >
        </div>
    </CredentialsModal>
  )
}

export default Login