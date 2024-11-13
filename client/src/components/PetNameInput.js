import React, { useState, useEffect } from 'react'

function PetNameInput({ petNameValue, setPetNameValue,invalidField,setInvalidField }) {

  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })
  // const [ checked, setChecked ] = useState(false)

  useEffect( () => {
    hasFocused.status == 'true' && hasBlurred.status == 'true'
    ? petNameValue == ''
      ?  setInputError({status:'true',message:'Pet name is required.'})
      :  setInputError({status:'false'})
    : null    
  }, [ petNameValue,hasFocused,hasBlurred ])

  // useEffect(() => {
  //   if(inputError?.status == 'true') setInvalidField({ status:'true', message: inputError.message })
  //   if(inputError?.status == 'false') setInvalidField({ status:'false' })
  // },[ inputError ])

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
      setPetNameValue(input)
    }
    // if(input.length >= 3) setChecked(true) 
    // else setChecked(false)
  }

  return(
    <>
      <label htmlFor='name' className='flex flex-col mb-2'>
        Pet Name:
        <input onBlur={hasBlurred.status == 'false' ? handleBlur : null} onFocus={hasFocused.status == 'false' ? handleFocus : null} id='name' name='name' type='text' onChange={handleInputChange} className={`w-full h-[48px] rounded-lg text-black px-2 focus:outline-none border focus:ring focus:ring-secondary-dark ${ inputError.message ? 'border-red-500' : 'border-gray-400' }`} value={petNameValue} />
        <div className={`italic text-red-700 transition transform ${ inputError?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{inputError?.message}</div>
      </label>
    </>
  )
}

export default PetNameInput