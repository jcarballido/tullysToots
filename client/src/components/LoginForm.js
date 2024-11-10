import React, { useState } from 'react'
// Component imports
import UsernameInput from './UsernameInput'
import PasswordInput from './PasswordInput'
import { Form } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'

const LoginForm = ({ error, setError, invitationToken }) => {

  const [ invalidUsername, setInvalidUsername ] = useState({status:'false'})
  const [ usernameValue, setUsernameValue ] = useState('')
  const [ invalidPassword, setInvalidPassword ] = useState({status:'false'})
  const [ passwordValue, setPasswordValue ] = useState('')
  // const encodedInvitationToken = invitationToken? encodeURIComponent(JSON.stringify(invitationToken)):encodeURIComponent(JSON.stringify(null))

  const handleClick = (e) => {
    setError({ status:'false' })
  }

  

  return(
    <Form className='max-h-max flex flex-col w-full px-8 mb-4 relative rounded-2xl bg-transparent blur-small shadow-2xl py-8' method='post' action={ `/?invite=${invitationToken}` } >
      <ErrorMessage error={ error } setError={ setError } />
      <UsernameInput setInvalidField={ setInvalidUsername } invalidField={invalidUsername} usernameValue={usernameValue} setUsernameValue={setUsernameValue} />
      <PasswordInput setInvalidField={ setInvalidPassword } invalidField={invalidPassword} label={'Password'} inputName={'password'} passwordValue={passwordValue} setPasswordValue={setPasswordValue} /> 
      <button disabled={usernameValue == '' || invalidUsername.status == 'true' || passwordValue == '' || invalidPassword.status == 'true'} type='submit' className={`flex justify-center items-center min-w-[48px] min-h-[48px] rounded-lg bg-accent text-white mt-2 disabled:bg-gray-300 disabled:text-gray-500`} onClick={handleClick}>Submit</button>
    </Form>
  )
}

export default LoginForm