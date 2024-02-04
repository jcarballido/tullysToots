import React, { useState, useEffect } from 'react'

function UsernameInput({setInvalidField }) {
  const [value, setValue] = useState('')
  const [ exceedsCharLimit, setExceedsCharLimit ] = useState(false)
 
  const handleInputChange = (e) => {
      e.preventDefault()
      const target = e.target
      const input = target.value
      setValue(input)
  }

  useEffect(() => {
    setExceedsCharLimit(value?.length > 25)
  }, [value])

  useEffect(() => {
    setInvalidField( exceedsCharLimit || value == '' || value == null)
  },[value])

  return(
    <label htmlFor='username' className='flex flex-col mb-2 min-h-[44px]'>
      Username:
      <input id='username' name='username' type='text' onChange={handleInputChange} className={`w-full text-black border-none outline-none ring-2 ring-gray-300 ${ exceedsCharLimit ? 'focus:ring-red-700':'focus:ring-accent-blue'}`} value={value} />
      <div className={`${ exceedsCharLimit ? 'visible':'invisible'} italic text-gray-500`}>Username is too long</div>
    </label>
  )
}

export default UsernameInput