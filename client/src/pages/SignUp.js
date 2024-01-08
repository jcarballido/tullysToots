import React,{ useState } from 'react'
// Components import
import CredentialsModal from '../components/CredentialsModal'
import SignUpForm from '../components/SignUpForm'

const SignUp = () => {
  return(
    <CredentialsModal>
        <div>
            Welcome!
        </div>
        <SignUpForm />
    </CredentialsModal>
  )
}

export default SignUp