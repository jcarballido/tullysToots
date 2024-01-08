import React from 'react'
// Component imports
import TextInput from '../components/TextInput.js'

const LoginForm = () => {
  return(
      <form className='border-2 border-black flex flex-col w-full px-8 mb-4'>
        <TextInput inputName={'Username'} />
        <TextInput inputName={'Password'} />
        <button type='submit' className='flex justify-center items-center'>Submit</button>
      </form>
  )
}

export default LoginForm