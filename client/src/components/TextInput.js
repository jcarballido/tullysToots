import React, { useState, useEffect } from 'react'

const TextInput = ({ inputName, setInvalidField, focusHandler }) => {   
    

    const [value, setValue] = useState('')
    const [ isActive, setIsActive ] = useState(false)
    const [ validEmailFormat, setValidEmailFormat ] = useState(false)

    const handleInputChange = (e) => {
        e.preventDefault()
        const target = e.target
        const input = target.value
        setValue(input)
    }

    const handleFocus = (e) => {
        setIsActive(true)
    }
    const handleBlur = (e) => {
        setIsActive(false)
    }

    useEffect( () => {
        console.log('Valid email format? ',validEmailFormat)
        const emailValidationRegex = /.+@[a-zA-Z0-9-.]+\.[a-zA-Z0-9]+$/gm
        setValidEmailFormat(emailValidationRegex.test(value))
    }, [value])

  useEffect(() => {
    if(inputName == 'Username'){
        value?.length > 25 || value == '' || value == null 
            ? setInvalidField(true)
            : setInvalidField(false) 
    }else {
        value == '' || value == null
            ? setInvalidField(true)
            : setInvalidField(false) 
    }
  },[value])



  return(
      <label htmlFor={`${inputName.toLowerCase()}`} className='flex flex-col mb-2 min-h-[44px]'>
          {`${inputName}`}:
          { focusHandler
            ? <input id={`${inputName.toLowerCase()}`} name={`${inputName.toLowerCase()}`} type='text' onFocus={ handleFocus } onBlur={ handleBlur } onChange={handleInputChange} className={`w-full text-black border-none outline-none ring-2 ring-gray-300 ${ !isActive && !validEmailFormat && value != '' ? 'ring-red-700':'focus:ring-accent-blue'}`} value={value} />
            : <input id={`${inputName.toLowerCase()}`} name={`${inputName.toLowerCase()}`} type='text' onChange={handleInputChange} className={`w-full text-black border-none outline-none ring-2 ring-gray-300 ${value?.length > 25 ? 'focus:ring-red-700':'focus:ring-accent-blue'}`} value={value} />
          }
          <div className={`${inputName === 'Username' && value.length > 25? 'visible':'invisible'} italic text-gray-500`}>Username character limit exceeded</div>
      </label>
  )
}

export default TextInput