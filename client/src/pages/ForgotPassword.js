import React, {useState } from 'react'
import { axiosPrivate } from '../api/axios'
import EmailInput from '../components/EmailInput'
import { Form } from 'react-router-dom'

const ForgotPassword = () => {

  // const [ isFocusedOn, setIsFocusedOn] = useState(false)
  const [ emailValue, setEmailValue] = useState('')
  // const [ validEmail, setValidEmail ] = useState(false)
  // const [ inputError, setInputError ] = useState(null)
  const [ invalidEmail, setInvalidEmail ] = useState({ state:'false' })
  
  // const handleFocus = () => {
  //   setIsFocusedOn(true)
  // }
  // const handleBlur = () => {
  //   setIsFocusedOn(false)
  // }
  // const handleInputChange = (e) => {
  //   e.preventDefault()
  //   const target = e.target
  //   const input = target.value
  //   const emailValidationRegex = /.+@[a-zA-Z0-9-.]+\.[a-zA-Z0-9]+$/gm
  //   if(emailValidationRegex.test(input)) setValidEmail(true)
  //   else setValidEmail(false)
  //   setValue(input)
  // }

  return (
    <div className='grow w-full flex flex-col gap-4 items-center'>
      <div className='w-full flex items-center justify-center text-xl font-bold mt-4'>Forgot your password?</div>    
      <div>Please enter the email associated with your account.</div>
      <Form className='flex flex-col w-full px-8 mb-4' method='post' action={ `/forgotPassword` }>
        <EmailInput invalidField={invalidEmail} setInvalidField={setInvalidEmail} emailValue={emailValue} setEmailValue={setEmailValue}/>
        <button disabled={invalidEmail.status == 'true' || emailValue == ''} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-accent text-white mt-2 disabled:bg-gray-300 disabled:text-gray-500 font-bold`}>
          Send Link
        </button>
      </Form>
    </div>
  )
}

export const action = async( { request } ) => {
  const formData = await request.formData()
  const email = formData.get('email')

  try{
      const response = await axiosPrivate.post('/account/forgotPassword', { email })
      const { success } = response.data
      return { success }
  }catch(err){
      const error = err.response.data.error
      return { error }
  }
}

export default ForgotPassword