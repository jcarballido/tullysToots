import React, { useEffect, useState } from 'react'
import { Form, useActionData } from 'react-router-dom'
import { axiosPrivate } from '../api/axios'
import useTextInput from '../hooks/useTextInput.js'
import UpdateErrorMessage from './UpdateErrorMessage.js'

const UpdatePassword = () => {

  const currentPasswordInput = useTextInput('')
  const newPasswordInput = useTextInput('')
  const confirmPasswordInput = useTextInput('')
  const actionResult = useActionData()

  const [ updateErrorMessage, setUpdateErrorMessage ] = useState({visible:false, message:null})
  const [ passwordMismatch, setPasswordMismatch ] = useState(false)
  const [ currentPasswordFocus, setCurrentPasswordFocus ] = useState({focused:false})
  const [ newPasswordFocus, setNewPasswordFocus ] = useState({focused:false})
  const [ confirmPasswordFocus, setConfirmPasswordFocus ] = useState({focused:false})

  if(actionResult?.error){
    setUpdateErrorMessage({ visible:true, message: actionResult.error })
  }

  // MAY NEED TO GO INTO A USE_EFFECT
  /*
  && !newPasswordFocus.focused && !confirmPasswordFocus.focused && newPasswordInput.value != '' && confirmPasswordInput.value != '')
  */
  useEffect( () => {
    if((newPasswordInput.value = confirmPasswordInput.value)) {
      setPasswordMismatch(false)
    }else if((newPasswordInput.value = confirmPasswordInput.value)){
      setPasswordMismatch(true)
    }
  },[newPasswordInput, confirmPasswordInput])
 

  return (
    <div className='w-full flex flex-col relative'>
      <UpdateErrorMessage visible={updateErrorMessage.visible} message={updateErrorMessage.message}/>
      Update Password
      <Form className='text-black' method='post' action='/updatePassword'>
        <label>
          Current Password
          <input type='text' name='currentPassword' {...currentPasswordInput} />
        </label>
        <label>
          New Password
          <input type='text' name='newPassword' {...newPasswordInput} onBlur={() => setNewPasswordFocus({ focused:false })} onFocus={() => setNewPasswordFocus({ focused:true })} />
        </label>
        <label>
          Confirm Password
          <input type='text' name='confirmPassword' {...confirmPasswordInput}  onBlur={() => setConfirmPasswordFocus({ focused:false })} onFocus={() => setConfirmPasswordFocus({ focused:true })}/>
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
  const formData = request.formData()
  const currentPassword = formData.get('currentPassword')
  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get('confirmPassword')

  if(newPassword != confirmPassword){
    return {error:'Passwords do not match!'}
  }

  /* VALIDATE PASSWORDS */

  try{
    await axiosPrivate.post('/account/updatePassword',{currentPassword, newPassword})
    return {success:'Password successfully updated!'}
  }catch(e){
    return {error:e}
  }

}

export default UpdatePassword