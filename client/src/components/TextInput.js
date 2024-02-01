import React, { useState, useEffect } from 'react'

const TextInput = ({ inputName, setInvalidField }) => {
  const [value, setValue] = useState('')

  const handleInputChange = (e) => {
      e.preventDefault()
      const target = e.target
      const input = target.value
      setValue(input)
  }

  useEffect(() => {
    if(inputName == 'Username'){
        value?.length > 25 || value == '' || value == null 
            ? setInvalidField(true)
            : setInvalidField(false) 
    } else{
        value == '' || value == null 
            ? setInvalidField(true)
            : setInvalidField(false) 
    }
  },[value])

  return(
      <label htmlFor={`${inputName.toLowerCase()}`} className='flex flex-col items-start mb-2 min-h-[44px]'>
          {`${inputName}`}:
          <input id={`${inputName.toLowerCase()}`} name={`${inputName.toLowerCase()}`} type='text' onChange={handleInputChange} className='w-full text-black' value={value}/>
      </label>
  )
}

export default TextInput