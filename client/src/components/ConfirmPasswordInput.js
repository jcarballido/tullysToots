import React,{ useState, useEffect } from 'react'
import eyeOpen from '../media/eye-open.svg'
import eyeOpenDark from '../media/eye-open-dark.svg'
import eyeClosed from '../media/eye-closed.svg'
import eyeClosedDark from '../media/eye-closed-dark.svg'


function PasswordInput({ passwordValue,confirmPasswordValue,setPasswordValue,invalidField,setInvalidField, label, inputName, iconColor, customMessage }) {
  // const [value, setValue] = useState('')
  const [ passwordVisible, setPasswordVisible ] = useState(false)
  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })

  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    setPasswordValue(input)
  }

  const handleShow = (e) => {
    e.preventDefault()
    setPasswordVisible(!passwordVisible)
  }
  
  const handleFocus = () => {
    if(hasFocused.status == 'false') setHasFocused({ status:'true' })
  }
  const handleBlur = () => {
    if(hasBlurred.status == 'false') setHasBlurred({ status:'true' })
  }

  useEffect( () => {

    // const message = customMessage?.present == 'true'? customMessage.message:'Re-enter your password.'

    hasFocused.status == 'true' && hasBlurred.status == 'true'
    ? (confirmPasswordValue == '' || confirmPasswordValue == null)  && passwordValue != ''
        ? setInputError({ status:'true', message: 'Re-enter your password.'})
        : passwordValue != confirmPasswordValue && (passwordValue != '' || passwordValue != null) && (confirmPasswordValue != '')
          ? setInputError({ status:'true', message:'Passwords do not match.' })
          : setInputError({ status:'false' })
 
    : null    
  }, [ passwordValue,confirmPasswordValue,hasFocused, hasBlurred ])

  useEffect(() => {
    if(inputError?.status == 'true') setInvalidField({ status:'true', message: inputError.message })
    if(inputError?.status == 'false') setInvalidField({ status:'false' })
  },[ inputError ])

  // useEffect(() => {
  //   setInvalidField(value == '' || value == null)
  // },[value])


  return(
    <label htmlFor='password' className='flex flex-col mb-2 w-full'>
      <div>{`${label}`}:</div>
      <div className='flex w-full h-[48px]'>
        <input onFocus={hasFocused.status == 'false' ? handleFocus:null } onBlur={hasBlurred.status == 'false' ? handleBlur:null } id='confrimPassword' name={`${inputName}`} type={passwordVisible ? 'text':'password'} onChange={handleInputChange} className={`grow text-black px-2 text-lg w-full rounded-lg focus:outline-none border focus:ring focus:ring-secondary-dark ${ invalidField.message ? 'border-red-500' : 'border-gray-400' }`} value={confirmPasswordValue} />
        <img className={`grow-0 max-h-[48px]`} onClick={ handleShow } src={passwordVisible? (iconColor ? eyeClosedDark:eyeClosed):(iconColor ? eyeOpenDark:eyeOpen)}/>
      </div>
      <div className={`italic text-red-700 transition transform ${ invalidField?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{invalidField?.message}</div>
    </label>
  )
}

export default PasswordInput