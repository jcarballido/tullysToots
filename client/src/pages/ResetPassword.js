import axios from '../api/axios'
import React, { useEffect, useState } from 'react'
import {
  useActionData,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import ExpiredResetToken from '../components/ExpiredResetToken'
import ResetPasswordForm from '../components/ResetPasswordForm'

const ResetPassword = () => {

  const actionData = useActionData()
  const [ validationError, setValidationError ] = useState(false)
  const [ message, setMessage ] = useState({})

  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()

  const resetToken = searchParams.get("resetToken")

  useEffect( () => {
    const validateResetToken = async() => {
      try {
        const encodedResetToken = encodeURIComponent(resetToken)
        const response = await axios.get(`/account/verifyResetToken?resetToken=${encodedResetToken}`)
        console.log('Response from token verification: ', response)
      } catch (error) {
        if(error.response.data.error == 'Empty reset token.'){
          navigate('/')
        }
        console.log('Error vaidating token: ', error)
        setValidationError(true)
      }
    }
    validateResetToken()
  }, [])

  useEffect( () => {
    if(actionData?.status) {
      setMessage(actionData)
    }
  },[actionData])

  return (
    <>
      <div className='flex justify-center items-center my-4 font-bold text-xl font-Lato'>Reset Password</div>
      {
        validationError
        ? <ExpiredResetToken/>
        : <ResetPasswordForm message={message} resetToken={ resetToken }/>
      }
    </>
  )
}

export const action = async({ request }) => {
  const formData = await request.formData()
  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get("confirmPassword")

  const trimmedNewPassword = newPassword.trim()
  const trimmedConfirmPassword = confirmPassword.trim()

  if(trimmedNewPassword != trimmedConfirmPassword) return { status:"error",message: 'Passwords must match!' }

  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  const resetToken = searchParams.get('resetToken')

  const encodedResetToken = encodeURIComponent(resetToken)

  try {
    const response = await axios.post(`/account/resetPassword?resetToken=${encodedResetToken}`, {trimmedNewPassword})
    return response.data
  } catch (error) {
    console.log('Error caught in axios request:', error)
    return {status:"error", message: 'Error processing request. Please request a new link.'}     
  }
} 

export default ResetPassword