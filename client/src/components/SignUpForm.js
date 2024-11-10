import React, { useEffect, useState } from "react"
import { Form } from 'react-router-dom'
//Components import
import EmailInput from "./EmailInput"
import PasswordInput from "./PasswordInput"
import ConfirmPasswordInput from "./ConfirmPasswordInput"
import SignUpUsernameInput from "./SignUpUsernameInput"
import ErrorMessage from "./ErrorMessage"
import SignUpPasswordInput from './SignUpPasswordInput'

const SignUpForm = ({ error, setError, invitationToken }) => {

  const [ invalidEmail, setInvalidEmail ] = useState({status:'false'})
  const [ emailValue, setEmailValue ] = useState('')
  const [ invalidUsername, setInvalidUsername ] = useState({status:'false'})
  const [ usernameValue, setUsernameValue ] = useState('')
  const [ invalidPassword, setInvalidPassword ] = useState({status:'false'})
  const [ passwordValue, setPasswordValue ] = useState('')
  const [ invalidConfirmationPassword, setInvalidConfirmationPassword ] = useState({status:'false'})
  const [ confirmPasswordValue, setConfirmPasswordValue ] = useState('')
  const [ passwordsMatch, setPasswordsMatch ] = useState({ status:'', message: ''})
  const [ allValidFields, setAllValidFields ] = useState(false)
  const [ validPasswordCheck,setValidPasswordCheck ] = useState(false)

  useEffect( () => {
    setAllValidFields(invalidEmail.status == 'false' && invalidConfirmationPassword.status == 'false' && invalidPassword.status == 'false' && invalidUsername.status == 'false' && emailValue != '' && usernameValue != '' && passwordValue != '' && confirmPasswordValue != '' && passwordValue == confirmPasswordValue && validPasswordCheck == true)
  })
  // useEffect(() => {
  //   if(!passwordsMatch) setAllValidFields(false)
  // }, [ passwordsMatch ])

  const handleClick = (e) => {
    setError({status:'false'})
  }



  return(
    <Form className='flex flex-col w-full px-8 mb-4' method='post' action={ `/signup?invite=${invitationToken}`}>
      <ErrorMessage error={ error } setError={ setError } />
      <EmailInput invalidField={invalidEmail} setInvalidField={setInvalidEmail} emailValue={emailValue} setEmailValue={setEmailValue} />
      <SignUpUsernameInput setInvalidField={ setInvalidUsername } invalidField={invalidUsername} usernameValue={usernameValue} setUsernameValue={setUsernameValue} />
      <SignUpPasswordInput setInvalidField={ setInvalidPassword } invalidField={invalidPassword} label={'Password'} inputName={'password'} passwordValue={passwordValue} setPasswordValue={setPasswordValue} setValidPasswordCheck={setValidPasswordCheck}/> 
      <ConfirmPasswordInput setInvalidField={ setInvalidConfirmationPassword } invalidField={invalidConfirmationPassword} label={'Confirm Password'} inputName={'confirmPassword'} passwordValue={passwordValue} confirmPasswordValue={confirmPasswordValue} setPasswordValue={setConfirmPasswordValue}/> 
      {/* <ConfirmPassword setInvalidField={ setInvalidConfirmationPassword }invalidField={invalidConfirmationPassword} /> */}
      <button disabled={!allValidFields} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-accent text-white mt-2 disabled:bg-gray-300 disabled:text-gray-500`} onClick={handleClick}>Submit</button> 
    </Form>
  )
}

export default SignUpForm