import React, { useState } from 'react'
import { Form } from 'react-router-dom'
import PasswordInput from './PasswordInput'


const ResetPasswordForm = ({ message,resetToken }) => {

  const [ passwordValue, setPasswordValue ] = useState('')
  const [ passwordVisible, setPasswordVisible ] = useState(false)
  
  const [ confirmPasswordValue, setConfirmPasswordValue ] = useState('')
  const [ confirmPasswordVisible, setConfirmPasswordVisible ] = useState(false)
  const [ invalidPassword, setInvalidPassword ] = useState(true)
  const [ invalidConfirmPassword, setInvalidConfirmPassword ] = useState(true)



  const handlePasswordChange = (e) => {
    const target = e.target
    const value = target.value
    setPasswordValue(value)
  }

  const handleConfirmPasswordChange = (e) => {
    const target = e.target
    const value = target.value
    setConfirmPasswordValue(value)
  }

  const handlePasswordShow = (e) => {
    e.preventDefault()
    setPasswordVisible(!passwordVisible)
  }

  const handleConfirmPasswordShow = (e) => {
    e.preventDefault()
    setConfirmPasswordVisible(!setConfirmPasswordVisible)
  }

  return(
    <div className='grow '>
      <div>
        { message.status == 'error'? `${message.message}`:null }
      </div>
      <Form method='post' action={`/resetPassword?resetToken=${resetToken} `} className='max-h-max flex flex-col w-full px-8 mb-4 relative rounded-2xl bg-transparent blur-small shadow-2xl py-8 items-center'>
        <PasswordInput setInvalidField={setInvalidPassword} label={'Password'} inputName={'newPassword'}/>
        <PasswordInput setInvalidField={setInvalidConfirmPassword} label={'Confirm Password'} inputName={'confirmPassword'}/>
        <button type='submit' className={`flex justify-center items-center min-w-[48px] min-h-[48px] px-2 rounded-lg bg-accent text-white mt-2 disabled:bg-gray-300 disabled:text-gray-500`}> 
          Submit 
        </button>
      </Form>
    </div>
  )
}

export default ResetPasswordForm