import React from 'react'
// Component imports
import TextInput from '../components/TextInput.js'
import { Form } from 'react-router-dom'
import axios from 'axios'

const LoginForm = () => {
  return(
      <Form className='flex flex-col w-full px-8 mb-4' method="post" action='/' >
        <TextInput inputName={'Username'} />
        <TextInput inputName={'Password'} />
        <button type='submit' className='flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2'>Submit</button>
      </Form>
  )
}



export default LoginForm