import React, { useState, useEffect } from 'react'

function UsernameInput({ usernameValue, setUsernameValue,invalidField,setInvalidField }) {

  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })
  const [ checked, setChecked ] = useState(false)

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
    if(input.length <= 26) {
      setUsernameValue(input)
    }
    if(input.length >= 3) setChecked(true) 
    else setChecked(false)
  }

  return(
    <>
      <div className='flex gap-4 items-center mt-4 justify-start  items-center'>
        <input type='checkbox' disabled checked={checked} className='appearance-none invisible scale-0 peer' />
        <div className='w-[15px] h-[15px] rounded-full bg-transparent border-[2px] border-gray-600 peer-checked:bg-green-500 peer-checked:border-black'></div>
        <div className='text-gray-600 peer-checked:text-black peer-checked:font-medium italic flex items-end'>At least 3 characters long.</div>
      </div>
      <label htmlFor='username' className='flex flex-col my-2'>
          Username:
          <input onBlur={hasBlurred.status == 'false' ? handleBlur : null} onFocus={hasFocused.status == 'false' ? handleFocus : null} id='username' name='username' type='text' onChange={handleInputChange} className={`w-full h-[48px] rounded-lg text-black px-2 focus:outline-none border focus:ring focus:ring-secondary-dark ${ invalidField.message ? 'border-red-500' : 'border-gray-400' }`} value={usernameValue} />
          <div className={`italic text-red-700 transition transform ${ invalidField?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{invalidField?.message}</div>
      </label>
    </>
  )
}

export default UsernameInput