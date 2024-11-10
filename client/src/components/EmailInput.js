import React, { useState, useEffect } from 'react'

function EmailInput({ invalidField,setInvalidField, emailValue,setEmailValue }) {
  // const [ isFocusedOn, setIsFocusedOn] = useState(false)
  // const [value, setValue] = useState('')
  // const [ validEmail, setValidEmail ] = useState(false)
  // const [ inputError, setInputError ] = useState(null)
  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })


  // const handleFocus = () => {
  //   setIsFocusedOn(true)
  // }
  // const handleBlur = () => {
  //   setIsFocusedOn(false)
  // }

  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    setEmailValue(input)
  }

  useEffect( () => {
    
    const emailValidationRegex = /.+@[a-zA-Z0-9-.]+\.[a-zA-Z0-9]+$/gm

    hasFocused.status == 'true' && hasBlurred.status == 'true'
    ? !emailValidationRegex.test(emailValue)
      ? setInputError({ status:'true', message:'Must be a valid email.' })
      : emailValue == '' || emailValue == null
        ? setInputError({ status:'true', message: 'Email is required.'})
        : setInputError({ status:'false' })
    : null    
  }, [ emailValue,hasFocused,hasBlurred ])
  
  useEffect(() => {
    if(inputError?.status == 'true') setInvalidField({ status:'true', message: inputError.message })
    if(inputError?.status == 'false') setInvalidField({ status:'false' })
  },[ inputError ])

  // useEffect(
  //   () => {
  //     value == '' || value == null
  //       ? setInvalidField(true)
  //       : validEmail == true
  //         ? setInvalidField(false)
  //         : setInvalidField(true)
  //   },[value,validEmail]
  // )

  // useEffect(() => {
  //   setInputError(!isFocusedOn && value != '' && !validEmail)
  // }, [isFocusedOn,value,validEmail])

  const handleFocus = () => {
    setHasFocused({ status:'true' })
  }
  const handleBlur = () => {
    setHasBlurred({ status:'true' })
  }

  return(
    <label htmlFor='email' className='flex flex-col mb-2'>
      Email:
      <input id='email' name='email' type='text' onFocus={ hasFocused.status == 'false' ? handleFocus : null } onBlur={hasBlurred.status == 'false' ? handleBlur : null } onChange={handleInputChange} className={`w-full text-black px-2 rounded-lg h-[48px] focus:outline-none border focus:ring focus:ring-secondary-dark ${ invalidField.message ? 'border-red-500' : 'border-gray-400' }`} value={emailValue} />  
      {/* <div className={`${ inputError ? 'visible':'invisible'} italic text-gray-500`}>Invalid email format</div> */}
      <div className={`italic text-red-700 transition transform ${ invalidField?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{invalidField?.message}</div>
    </label>
  )
}

export default EmailInput