import React, { useState } from 'react'
// Component imports
import UsernameInput from './UsernameInput'
import PasswordInput from './PasswordInput'
import { Form } from 'react-router-dom'

const LoginForm = () => {

  const [ invalidUsername, setInvalidUsername ] = useState(true)
  const [ invalidPassword, setInvalidPassword ] = useState(true)

  return(
    <Form className='flex flex-col w-full px-8 mb-4' method='post' action='/' >
      <UsernameInput setInvalidField={ setInvalidUsername } />
      <PasswordInput setInvalidField={ setInvalidPassword }/>
      <button disabled={Boolean(invalidUsername || invalidPassword)} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2 disabled:bg-gray-300 disabled:text-gray-500`}>Submit</button>
    </Form>
  )
}

export default LoginForm