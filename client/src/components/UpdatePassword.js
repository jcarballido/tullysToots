import React, { useEffect, useState } from 'react'
import { Form, useActionData, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate.js'
import useTextInput from '../hooks/useTextInput.js'
// import UpdateErrorMessage from './UpdateErrorMessage.js'
// import { axiosPrivate } from '../api/xios.js'
import Toast from './Toast.js'
import { axiosPrivate } from '../api/axios.js'
// import PasswordInput from './PasswordInput.js'
import SignUpPasswordInput from './SignUpPasswordInput.js'
import ConfirmPasswordInput from './ConfirmPasswordInput.js'


const UpdatePassword = () => {

    const axiosPrivate = useAxiosPrivate()

  const currentPasswordInput = useTextInput('')
  const newPasswordInput = useTextInput('')
  const confirmPasswordInput = useTextInput('')
  const actionResult = useActionData()
  const navigate = useNavigate()

  // const [ toast, setToast ] = useState({visible:false, message:null})
  // const [ passwordMismatch, setPasswordMismatch ] = useState(false)
  // const [ invalidCurrentPassword, setInvalidCurrentPassword ] = useState(false)
  // const [ invalidNewPassword, setInvalidNewPassword ] = useState(false)
  // const [ invalidConfirmPassword, setInvalidConfirmPassword ] = useState(false)
  const [ invalidPassword, setInvalidPassword ] = useState({status:'false'})
  const [ passwordValue, setPasswordValue ] = useState('')
  const [ invalidConfirmationPassword, setInvalidConfirmationPassword ] = useState({status:'false'})
  const [ confirmPasswordValue, setConfirmPasswordValue ] = useState('')
  const [ validPasswordCheck,setValidPasswordCheck ] = useState(false)
  const [ allValidFields, setAllValidFields ] = useState(false)

  // useEffect( () => {
  //   if(actionResult?.error){
  //     // setToast({ visible:true, message: 'Error', result:'-' })  
  //     console.log('Error updating.')
  //   }else if(actionResult?.success){
  //     // setToast({ visible:true, message: actionResult.success, result:'+' })
  //     console.log('Successfullyt changed')
  //   }
  // },[actionResult])

  // MAY NEED TO GO INTO A USE_EFFECT
  /*
  && !newPasswordFocus.focused && !confirmPasswordFocus.focused && newPasswordInput.value != '' && confirmPasswordInput.value != '')
  */
  // useEffect( () => {
  //   if(newPasswordInput.value != confirmPasswordInput.value && !newPasswordInput.infocus && !confirmPasswordInput.infocus && newPasswordInput.value && confirmPasswordInput.value) {
  //       setPasswordMismatch(true)
  //     }else{
  //       setPasswordMismatch(false)
  //     }
  // },[newPasswordInput, confirmPasswordInput])

  // console.log('Password mismatch: ', passwordMismatch)

  useEffect( () => {
    setAllValidFields(invalidConfirmationPassword.status == 'false' && invalidPassword.status == 'false' && passwordValue != '' && confirmPasswordValue != '' && passwordValue == confirmPasswordValue && validPasswordCheck == true)
  })
  

  return (
    <div className='w-full flex flex-col'>
      {/* <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast }/> */}
      <div className='w-full flex items-center font-bold mb-2  text-xl'>Update Password</div>
      <Form className='text-black w-full flex flex-col' method='post' action='/updatePassword'>
        <SignUpPasswordInput setInvalidField={ setInvalidPassword } invalidField={invalidPassword} label={'New Password'} inputName={'password'} passwordValue={passwordValue} setPasswordValue={setPasswordValue} setValidPasswordCheck={setValidPasswordCheck} iconColor='true' /> 
        <ConfirmPasswordInput setInvalidField={ setInvalidConfirmationPassword } invalidField={invalidConfirmationPassword} label={'Confirm Password'} inputName={'confirmPassword'} passwordValue={passwordValue} confirmPasswordValue={confirmPasswordValue} setPasswordValue={setConfirmPasswordValue} iconColor='true' /> 
        {/* <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Current Password</div>
          <input className='rounded-md w-full focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none  px-2 text-lg' type='text' name='currentPassword' {...currentPasswordInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>New Password</div>
          <input className='rounded-md w-full focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none  px-2 text-lg' type='text' name='newPassword' {...newPasswordInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Confirm Password</div>
          <input className='rounded-md w-full focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none  px-2 text-lg' type='text' name='confirmPassword' {...confirmPasswordInput} />
        </label> */}
        {/* <div className={`${passwordMismatch? 'visible':'invisible'}` } >
          Passwords must match
        </div> */}
        <button type='submit' className='flex justify-center items-center h-[48px] bg-accent px-2 rounded-md text-white text-lg font-bold max-w-min disabled:bg-gray-300 disabled:text-gray-500' disabled={!allValidFields} >SUBMIT</button>
      </Form>
    </div>
  )
}

export const action = async({ request }) => {

  // const axiosPrivate = useAxiosPrivate()

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