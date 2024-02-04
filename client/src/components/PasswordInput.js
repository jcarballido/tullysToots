import React,{ useState, useEffect } from 'react'

function PasswordInput({ setInvalidField }) {
  const [value, setValue] = useState('')
  const [ passwordVisible, setPasswordVisible ] = useState(false)

  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    setValue(input)
  }

  const handleShow = (e) => {
    e.preventDefault()
    setPasswordVisible(!passwordVisible)
  }

  useEffect(() => {
    setInvalidField(value == '' || value == null)
  },[value])

  return(
    <label htmlFor='password' className='flex flex-col mb-2 min-h-[44px]'>
      <div>Password:</div>
      <div className='flex'>
        <input id='password' name='password' type={passwordVisible ? 'text':'password'} onChange={handleInputChange} className='grow text-black border-none outline-none ring-2 ring-gray-300 focus:ring-accent-blue' value={value} />
        <button className='flex justify-center items-center max-w-max' onClick={ handleShow } >SHOW</button>
      </div>
      
    </label>
  )
}

export default PasswordInput