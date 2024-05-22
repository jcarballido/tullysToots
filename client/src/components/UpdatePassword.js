import React, { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'
import useTextInput from '../hooks/useTextInput.js'
import UpdateErrorMessage from './UpdateErrorMessage.js'
import { axiosPrivate } from '../api/axios.js'

const UpdatePassword = () => {

  const axiosPrivate = useAxiosPrivate()
  const currentPasswordInput = useTextInput('')
  const newPasswordInput = useTextInput('')
  const confirmPasswordInput = useTextInput('')
  const actionResult = useActionData()

  console.log('UpdatePassword action result: ', actionResult)

  const [ updateErrorMessage, setUpdateErrorMessage ] = useState({visible:false, message:null})
  const [ passwordMismatch, setPasswordMismatch ] = useState(false)

  // if(actionResult?.error){
  //   setUpdateErrorMessage({ visible:true, message: actionResult.error })
  // }

  // MAY NEED TO GO INTO A USE_EFFECT
  /*
  && !newPasswordFocus.focused && !confirmPasswordFocus.focused && newPasswordInput.value != '' && confirmPasswordInput.value != '')
  */
  useEffect( () => {
    if(newPasswordInput.value != confirmPasswordInput.value && !newPasswordInput.infocus && !confirmPasswordInput.infocus && newPasswordInput.value && confirmPasswordInput.value) {
        setPasswordMismatch(true)
      }else{
        setPasswordMismatch(false)
      }
  },[newPasswordInput, confirmPasswordInput])

  // console.log('Password mismatch: ', passwordMismatch)

  return (
    <div className='w-full flex flex-col relative'>
      <UpdateErrorMessage visible={updateErrorMessage.visible} message={updateErrorMessage.message}/>
      Update Password
      <Form className='text-black w-full flex flex-col' method='post' action='/updatePassword'>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Current Password</div>
          <input className='w-full' type='text' name='currentPassword' {...currentPasswordInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>New Password</div>
          <input className='w-full' type='text' name='newPassword' {...newPasswordInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Confirm Password</div>
          <input className='w-full' type='text' name='confirmPassword' {...confirmPasswordInput} />
        </label>
        <div className={`${passwordMismatch? 'visible':'invisible'}` } >
          Passwords must match
        </div>
        <button type='submit' disabled={passwordMismatch || !newPasswordInput.value || !confirmPasswordInput.value || !currentPasswordInput.value} >SUBMIT</button>
      </Form>
    </div>
  )
}

export const action = async({ request }) => {
  const formData = await request.formData()
  const currentPassword = formData.get('currentPassword')
  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get('confirmPassword')

  if(newPassword != confirmPassword){
    return {error:'Passwords do not match!'}
  }

  if(!newPassword || !currentPassword || !confirmPassword){
    return { error: 'All fields are required'}
  }

  try{
    await axiosPrivate.post('/account/updatePassword',{currentPassword, newPassword})
    console.log('Axios request made...')
    return {success:'Password successfully updated!'}
  }catch(e){
    return {error:e}
  }

}

export default UpdatePassword