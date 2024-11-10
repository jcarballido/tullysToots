import React,{ useState, useEffect } from 'react'
import eyeOpen from '../media/eye-open.svg'
import eyeOpenDark from '../media/eye-open-dark.svg'
import eyeClosed from '../media/eye-closed.svg'
import eyeClosedDark from '../media/eye-closed-dark.svg'


function PasswordInput({ passwordValue,setPasswordValue,invalidField,setInvalidField, label, inputName, iconColor, customMessage, setValidPasswordCheck }) {
  // const [value, setValue] = useState('')
  const [ passwordVisible, setPasswordVisible ] = useState(false)
  const [ inputError, setInputError ] = useState({ status:'false' }) 
  const [ hasFocused, setHasFocused ] = useState({ status:'false' })
  const [ hasBlurred, setHasBlurred ] = useState({ status:'false' })
  const [ checked, setChecked ] = useState({ numCharacters:'false',digit:'false',symbol:'false' })

  const handleInputChange = (e) => {
    e.preventDefault()
    const target = e.target
    const input = target.value
    const numCharactersRegex = /.{6,}/
    const digitRegex = /\d{1,}/
    const symbolRegex = /[!@#$%^&*.]/
    if(numCharactersRegex.test(input)){
      setChecked(previousCheckedState => {return {...previousCheckedState,numCharacters:'true'}})
    }else{
      setChecked(previousCheckedState => {return {...previousCheckedState,numCharacters:'false'}})
    }
    if(digitRegex.test(input)){
      setChecked(previousCheckedState => {return {...previousCheckedState,digit:'true'}})
    }else{
      setChecked(previousCheckedState => {return {...previousCheckedState,digit:'false'}})
    }
    if(symbolRegex.test(input)){
      setChecked(previousCheckedState => {return {...previousCheckedState,symbol:'true'}})
    }else{
      setChecked(previousCheckedState => {return {...previousCheckedState,symbol:'false'}})
    }
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

    const message = customMessage?.present == 'true'? customMessage.message:'Password is required'

    hasFocused.status == 'true' && hasBlurred.status == 'true'
    ? passwordValue == '' || passwordValue == null
        ? setInputError({ status:'true', message})
        : setInputError({ status:'false' })
    : null    
  }, [ passwordValue,hasFocused, hasBlurred ])

  useEffect(() => {
    if(inputError?.status == 'true') setInvalidField({ status:'true', message: inputError.message })
    if(inputError?.status == 'false') setInvalidField({ status:'false' })
  },[ inputError ])

  useEffect( () => {
    if(checked.digit == 'true' && checked.symbol == 'true' && checked.numCharacters == 'true'){
      setValidPasswordCheck(true)
    }else{
      setValidPasswordCheck(false)
    }
  },[checked])

  // useEffect(() => {
  //   setInvalidField(value == '' || value == null)
  // },[value])

  return(
    <>
      <div className='flex gap-4 items-center mt-4 justify-start  items-center'>
        <input value='digit' type='checkbox' disabled checked={checked.digit == 'true'} className='appearance-none invisible scale-0 peer' />
        <div className='w-[15px] h-[15px] rounded-full bg-transparent border-[2px] border-gray-600 peer-checked:bg-green-500 peer-checked:border-black'></div>
        <div className='text-gray-600 peer-checked:text-black peer-checked:font-medium italic flex items-end'>Includes at least 1 digit.</div>
      </div>
      <div className='flex gap-4 items-center mt-4 justify-start  items-center'>
        <input value='symbol' type='checkbox' disabled checked={checked.symbol == 'true'} className='appearance-none invisible scale-0 peer' />
        <div className='w-[15px] h-[15px] rounded-full bg-transparent border-[2px] border-gray-600 peer-checked:bg-green-500 peer-checked:border-black'></div>
        <div className='text-gray-600 peer-checked:text-black peer-checked:font-medium italic flex items-end'>Includes at least 1 symbol.</div>
      </div>
      <div className='flex gap-4 items-center mt-4 justify-start  items-center'>
        <input type='checkbox' value='numCharacters' disabled checked={checked.numCharacters == 'true'} className='appearance-none invisible scale-0 peer' />
        <div className='w-[15px] h-[15px] rounded-full bg-transparent border-[2px] border-gray-600 peer-checked:bg-green-500 peer-checked:border-black'></div>
        <div className='text-gray-600 peer-checked:text-black peer-checked:font-medium italic flex items-end'>At least 6 characters long.</div>
      </div>
      <label htmlFor='password' className='flex flex-col my-2 w-full'>
        <div>{`${label}`}:</div>
        <div className='flex w-full h-[48px]'>
          <input onFocus={hasFocused.status == 'false' ? handleFocus:null } onBlur={hasBlurred.status == 'false' ? handleBlur:null } id='password' name={`${inputName}`} type={passwordVisible ? 'text':'password'} onChange={handleInputChange} className={`grow text-black px-2 text-lg w-full rounded-lg focus:outline-none border focus:ring focus:ring-secondary-dark ${ invalidField.message ? 'border-red-500' : 'border-gray-400' }`} value={passwordValue} />
          <img className={`grow-0 max-h-[48px]`} onClick={ handleShow } src={passwordVisible? (iconColor == 'true' ? eyeClosedDark:eyeClosed):(iconColor == 'true' ? eyeOpenDark:eyeOpen)}/>
        </div>
        <div className={`italic text-red-700 transition transform ${ invalidField?.status == 'true' ? 'visible scale-100':'scale-0 invisible'}`}>{invalidField?.message}</div>
      </label>
    </>
  )
}

export default PasswordInput