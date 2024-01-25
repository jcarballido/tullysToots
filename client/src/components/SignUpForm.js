import React from "react"
//Components import
import TextInput from "./TextInput"

const SignUpForm = () => {
  return(
      <form className='flex flex-col w-full px-8 mb-4'>
          <TextInput inputName={'Email'} />
          <TextInput inputName={'Username'} />
          <TextInput inputName={'Password'} />
          <button type='submit' className='flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2'>Submit</button> 
      </form>
  )
}

export default SignUpForm