import React,{ useState, useEffect } from 'react'
import eyeOpen from '../media/eye-open.svg'
import eyeClosed from '../media/eye-closed.svg'

function ConfirmPassword({ setInvalidField }) {
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
    <label htmlFor='password' className='flex flex-col mb-2 w-full'>
      <div>Confirm Password:</div>
      <div className='flex w-full h-[48px]'>
        <input id='password' name='password' type={passwordVisible ? 'text':'password'} onChange={handleInputChange} className='grow text-black focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none w-full rounded-lg px-2' value={value} />
        <img className='grow-0 max-h-[48px] fill-white' onClick={ handleShow } src={passwordVisible? eyeClosed:eyeOpen}/>
      </div>
    </label>
  )
}

export default ConfirmPassword