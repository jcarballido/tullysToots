import React from "react"
//Components import
import TextInput from "./TextInput"

const SignUpForm = () => {
  return(
      <form className='border-2 border-black flex flex-col max-w-max'>
          <TextInput inputName={'Email'} />
          <TextInput inputName={'Username'} />
          <TextInput inputName={'Password'} />
          <button type='submit'>Submit</button>
          Already have an account?
          <button>
              <a href='/signup'>Sign in</a>
          </button > 
      </form>
  )
}

export default SignUpForm