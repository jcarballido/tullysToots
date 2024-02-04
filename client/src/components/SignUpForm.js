import React, { useEffect, useState } from "react"
import { Form } from 'react-router-dom'
//Components import
import EmailInput from "./EmailInput"
import PasswordInput from "./PasswordInput"
import UsernameInput from "./UsernameInput"

const SignUpForm = () => {

  const [ invalidEmail, setInvalidEmail ] = useState(true)
  const [ invalidUsername, setInvalidUsername ] = useState(true)
  const [ invalidPassword, setInvalidPassword ] = useState(true)


  return(
    <Form className='flex flex-col w-full px-8 mb-4'>
      <EmailInput setInvalidField={setInvalidEmail}/>
      <UsernameInput setInvalidField={ setInvalidUsername } />
      <PasswordInput setInvalidField={ setInvalidPassword } />
      <button disabled={Boolean(invalidUsername || invalidPassword || invalidEmail)} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2 disabled:bg-gray-300 disabled:text-gray-500`}>Submit</button> 
    </Form>
  )
}

export default SignUpForm