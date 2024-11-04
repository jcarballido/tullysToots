import React, { useState } from 'react'
// Component imports
import UsernameInput from './UsernameInput'
import PasswordInput from './PasswordInput'
import { Form } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'

const LoginForm = ({ error, setError, invitationToken }) => {

  const [ invalidUsername, setInvalidUsername ] = useState(true)
  const [ invalidPassword, setInvalidPassword ] = useState(true)
  // const encodedInvitationToken = invitationToken? encodeURIComponent(JSON.stringify(invitationToken)):encodeURIComponent(JSON.stringify(null))

  return(
    <Form className='max-h-max flex flex-col w-full px-8 mb-4 relative rounded-2xl bg-transparent blur-small shadow-2xl py-8' method='post' action={ `/?invite=${invitationToken}` } >
      <UsernameInput setInvalidField={ setInvalidUsername } />
      <PasswordInput setInvalidField={ setInvalidPassword } label={'Password'} inputName={'password'}/> 
      <button disabled={Boolean(invalidUsername || invalidPassword)} type='submit' className={`flex justify-center items-center min-w-[48px] min-h-[48px] rounded-lg bg-accent text-white mt-2 disabled:bg-gray-300 disabled:text-gray-500`}>Submit</button>
      <ErrorMessage error={ error } setError={ setError } />
    </Form>
  )
}

export default LoginForm