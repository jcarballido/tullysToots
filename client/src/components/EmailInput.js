import React, { useState, useEffect } from 'react'

function EmailInput({ setInvalidField }) {
  const [ isFocusedOn, setIsFocusedOn] = useState(false)
  const [value, setValue] = useState('')
  const [ validEmail, setValidEmail ] = useState(false)
  const [ inputError, setInputError ] = useState(null)

  const handleFocus = () => {
    setIsFocusedOn(true)
  }
  const handleBlur = () => {
    setIsFocusedOn(false)
  }
  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    const emailValidationRegex = /.+@[a-zA-Z0-9-.]+\.[a-zA-Z0-9]+$/gm
    if(emailValidationRegex.test(input)) setValidEmail(true)
    else setValidEmail(false)
    setValue(input)
  }

  useEffect(
    () => {
      value == '' || value == null
        ? setInvalidField(true)
        : validEmail == true
          ? setInvalidField(false)
          : setInvalidField(true)
    },[value,validEmail]
  )

  useEffect(() => {
    setInputError(!isFocusedOn && value != '' && !validEmail)
  }, [isFocusedOn,value,validEmail])

  return(
    <label htmlFor='email' className='flex flex-col mb-2'>
        Email:
        <input id='email' name='email' type='text' onFocus={ handleFocus } onBlur={ handleBlur } onChange={handleInputChange} className={`w-full text-black border-none outline-none ring-2 ring-gray-300 rounded-lg h-[40px] ${ inputError ? 'ring-red-700':'focus:ring-accent-blue'}`} value={value} />  
        <div className={`${ inputError ? 'visible':'invisible'} italic text-gray-500`}>Invalid email format</div>
    </label>
  )
}

export default EmailInput