import React, { useState, useEffect } from 'react'

function ConfirmUsernameInput({ usernameValue, setUsernameValue,invalidField,setInvalidField }) {

  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })

  useEffect( () => {
    hasFocused.status == 'true' && hasBlurred.status == 'true'
    ? usernameValue.length > 25
      ? setInputError({ status:'true', message:'Username is too long.' })
      : usernameValue == '' || usernameValue == null
        ? setInputError({ status:'true', message: 'Username is required.'})
        : setInputError({ status:'false' })
    : null    
  }, [ usernameValue,hasFocused,hasBlurred ])

  useEffect(() => {
    if(inputError?.status == 'true') setInvalidField({ status:'true', message: inputError.message })
    if(inputError?.status == 'false') setInvalidField({ status:'false' })
  },[ inputError ])

  const handleFocus = () => {
    setHasFocused({ status:'true' })
  }
  const handleBlur = () => {
    setHasBlurred({ status:'true' })
  }

  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    if(input.length <= 26) setUsernameValue(input)
  }

  return(
    <label htmlFor='username' className='flex flex-col mb-2'>
        Username:
        <input onBlur={hasBlurred.status == 'false' ? handleBlur : null} onFocus={hasFocused.status == 'false' ? handleFocus : null} id='username' name='username' type='text' onChange={handleInputChange} className={`w-full h-[48px] rounded-lg text-black px-2 focus:outline-none border focus:ring focus:ring-secondary-dark ${ invalidField.message ? 'border-red-500' : 'border-gray-400' }`} value={usernameValue} />
        <div className={`italic text-red-700 transition transform ${ invalidField?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{invalidField?.message}</div>
    </label>
  )
}

export default ConfirmUsernameInput