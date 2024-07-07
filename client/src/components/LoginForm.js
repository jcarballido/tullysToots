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
    <Form className='flex flex-col w-full px-8 mb-4 relative' method='post' action={ `/?invite=${invitationToken}` } >
      <UsernameInput setInvalidField={ setInvalidUsername } />
      <PasswordInput setInvalidField={ setInvalidPassword }/> 
      <button disabled={Boolean(invalidUsername || invalidPassword)} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2 disabled:bg-gray-300 disabled:text-gray-500`}>Submit</button>
      <ErrorMessage error={ error } setError={ setError } />
    </Form>
  )
}

export default LoginForm