import React from 'react'
import { Form } from 'react-router-dom'


const ResetPasswordForm = ({ message,resetToken }) => {

  const [ passwordValue, setPasswordValue ] = useState('')
  const [ passwordVisible, setPasswordVisible ] = useState(false)
  
  const [ confirmPasswordValue, setConfirmPasswordValue ] = useState('')
  const [ confirmPasswordVisible, setConfirmPasswordVisible ] = useState(false)


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
    <>
      <div>
        { message? `${message.result}`:null }
      </div>
      <Form method='post' action={`/resetPassword?resetToken=${resetToken}`}>
        <label htmlFor='newPassword' className='flex flex-col mb-2 min-h-[44px]'>
          <div>Password:</div>
          <div className='flex'>
            <input id='newPassword' name='newPassword' type={passwordVisible ? 'text':'password'} onChange={handlePasswordChange} className='grow text-black border-none outline-none ring-2 ring-gray-300 focus:ring-accent-blue' value={passwordValue} />
            <button className='flex justify-center items-center max-w-max' onClick={ handlePasswordShow } >SHOW</button>
          </div>
        </label>
        <label htmlFor='confirmPassword' className='flex flex-col mb-2 min-h-[44px]'>
          <div>Confirm Password:</div>
          <div className='flex'>
            <input id='confirmPassword' name='confirmPassword' type={confirmPasswordVisible ? 'text':'password'} onChange={handleConfirmPasswordChange} className='grow text-black border-none outline-none ring-2 ring-gray-300 focus:ring-accent-blue' value={confirmPasswordValue} />
            <button className='flex justify-center items-center max-w-max' onClick={ handleConfirmPasswordShow } >SHOW</button>
          </div>
        </label>
        <button type='submit'> 
          SUBMIT  
        </button>
      </Form>
    </>
   )
}

export default ResetPasswordForm