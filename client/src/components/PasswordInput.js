import React,{ useState, useEffect } from 'react'
import eyeOpen from '../media/eye-open.svg'
import eyeClosed from '../media/eye-closed.svg'

function PasswordInput({ setInvalidField, label, inputName }) {
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
      <div>{`${label}`}:</div>
      <div className='flex w-full h-[40px]'>
        <input id='password' name={`${inputName}`} type={passwordVisible ? 'text':'password'} onChange={handleInputChange} className='grow text-black border-none outline-none ring-2 ring-gray-300 focus:ring-accent-blue w-full rounded-lg' value={value} />
        <img className='grow-0 max-h-[48px] fill-white' onClick={ handleShow } src={passwordVisible? eyeClosed:eyeOpen}/>
      </div>
    </label>
  )
}

export default PasswordInput