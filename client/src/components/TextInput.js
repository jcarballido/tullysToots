import React, { useState } from 'react'

const TextInput = ({ inputName }) => {
  const [value, setValue] = useState('')

  const handleInputChange = (e) => {
      e.preventDefault()
      const target = e.target
      const input = target.value
      setValue(input)
  }

  return(
      <label for={`${inputName.toLowerCase()}`} className='flex flex-col items-start mb-2 min-h-[44px]'>
          {`${inputName}`}:
          <input id={`${inputName.toLowerCase()}`} type='text' onChange={handleInputChange} className='w-full' value={value}/>
      </label>
  )
}

export default TextInput