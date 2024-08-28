import axios from '../api/axios'
import React, { useEffect, useState } from 'react'
import {
  useActionData,
  useSearchParams
} from 'react-router-dom'

const ResetPassword = () => {

  const actionData = useActionData()
  const [ validationError, setValidationError ] = useState(false)
  const [ message, setMessage ] = useState({})

  const [ searchParams ] = useSearchParams()

  const resetToken = searchParams.get("resetToken")

  useEffect( () => {
    const validateResetToken = async() => {
      try {
        const encodedResetToken = encodeURIComponent(resetToken)
        const response = await axios.get(`/account/verifyResetToken?resetToken=${encodedResetToken}`)
      } catch (error) {
        console.log('Error vaidating token: ', error)
        setValidationError(true)
      }
    }
    validateResetToken()
  }, [])

  useEffect( () => {
    if(actionData?.result) {
      setMessage(actionData.result)
    }
  },[actionData])

  return (
    <>
      <div>ResetPassword</div>
      {
        validationError
        ? <ExpiredResetToken/>
        : <ResetPasswordForm message={message} />
      }
    </>
  )
}

export const action = async({ request }) => {
  const formData = await request.formData()
  const newPassword = formData.get("newPassword")

  try {
    const response = await axios.post('/account/resetPassword', newPassword)
    const { success } = response.data
    return {success}
  } catch (error) {
    console.log('Error caught in axios request:', error)
    return {error}     
  }
} 

export default ResetPassword