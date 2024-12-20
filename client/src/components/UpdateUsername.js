import React, { useState, useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useTextInput from '../hooks/useTextInput'
import { useActionData, useNavigate, Form } from 'react-router-dom'
import Toast from './Toast'
import { axiosPrivate } from '../api/axios'
import NewUsernameInput from './NewUsernameInput'
import ErrorMessage from './ErrorMessage'

const UpdateUsername = () => {

  const axiosPrivate = useAxiosPrivate()
  const currentUsernameInput = useTextInput('')
  const newUsernameInput = useTextInput('')
  const confirmUsernameInput = useTextInput('')
  const actionData = useActionData()
  const navigate = useNavigate()

  // console.log('UpdatePassword action result: ', actionResult)

  // const [ toast, setToast ] = useState({visible:false, message:null})
  // const [ usernameMismatch, setUsernameMismatch ] = useState(false)
  const [ invalidUsername, setInvalidUsername ] = useState({status:'false'})
  const [ usernameValue, setUsernameValue ] = useState('')
  const [ error,setError ] = useState({status: 'false'})

  useEffect(() => {
    if(actionData?.error) {
      console.log(actionData)
      setError({ status:'true', message:'Username is already taken. Please try a different one.'})
    }
  }, [actionData])


  // useEffect( () => {
  //   if(actionResult?.error){
  //     setToast({ visible:true, message: 'Error', result:'-' })  
  //   }else if(actionResult?.success){
  //     setToast({ visible:true, message: actionResult.success, result:'+' })
  //     const redirectTimer = setTimeout( () => {
  //       navigate('/account')
  //     },5000)
  //     return () => clearTimeout(redirectTimer)
  //   }
  // },[actionResult])

  // MAY NEED TO GO INTO A USE_EFFECT
  /*
  && !newPasswordFocus.focused && !confirmPasswordFocus.focused && newPasswordInput.value != '' && confirmPasswordInput.value != '')
  */
  // useEffect( () => {
  //   if(newUsernameInput.value != confirmUsernameInput.value && !newUsernameInput.infocus && !confirmUsernameInput.infocus && newUsernameInput.value && confirmUsernameInput.value) {
  //       setUsernameMismatch(true)
  //     }else{
  //       setUsernameMismatch(false)
  //     }
  // },[newUsernameInput, confirmUsernameInput])

  // console.log('Password mismatch: ', passwordMismatch)

  const handleClick = (e) => {
    setError({status:'false'})
  }

  return (
    <div className='w-full flex flex-col'>
      <div className='w-full flex items-center font-bold mb-2  text-xl'>Update Username</div>
      <Form method='post' action='/updateUsername' className={ `flex flex-col gap-2 justify-start items-start text-black z-10   rounded-2xl w-full` }>
        <ErrorMessage error={error} setError={setError} />
        <NewUsernameInput invalidField={invalidUsername} setInvalidField={setInvalidUsername} usernameValue={usernameValue} setUsernameValue={setUsernameValue} />
        <button type='submit' className='flex justify-center items-center h-[48px] bg-accent px-2 rounded-md text-white text-lg font-bold disabled:bg-gray-300 disabled:text-gray-500' disabled={usernameValue == '' || invalidUsername.status == 'true' || usernameValue.length <3} onClick={handleClick} >SUBMIT</button>
      </Form>
    </div>
  )
}

export const action = async({ request }) => {

  // const axiosPrivate = useAxiosPrivate()
  const formData = await request.formData()
  const currentUsername = formData.get('currentUsername')
  const newUsername = formData.get('newUsername')
  const confirmUsername = formData.get('confirmUsername')

  if(newUsername != confirmUsername){
    return {error:'Usernames do not match!'}
  }

  if(!newUsername || !currentUsername || !confirmUsername){
    return { error: 'All fields are required'}
  }

  try{
    await axiosPrivate.post('/account/updateUsername',{currentUsername, newUsername})
    console.log('Axios request made...')
    return {success:'Username successfully updated!'}
  }catch(e){
    // console.log('Error from axios post when attempting to change usernames: ', e)
    return {error:e}
  }

}

  

export default UpdateUsername

{/* <Form className='text-black w-full flex flex-col' method='post' action='/updateUsername'>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Current Username</div>
          <input className='w-full' type='text' name='currentUsername' {...currentUsernameInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>New Username</div>
          <input className='w-full' type='text' name='newUsername' {...newUsernameInput} />
        </label>
        <label className='w-full flex flex-col items-start'>
          <div className='flex w-full'>Confirm Username</div>
          <input className='w-full' type='text' name='confirmUsername' {...confirmUsernameInput} />
        </label>
        <div className={`${usernameMismatch? 'visible':'invisible'}` } >
          Username must match
        </div>
        <button type='submit' disabled={usernameMismatch || !newUsernameInput.value || !confirmUsernameInput.value || !currentUsernameInput.value} >SUBMIT</button>
      </Form> */}