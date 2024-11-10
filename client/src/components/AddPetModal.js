import React, { useState,useEffect } from 'react'
import { Form } from 'react-router-dom'
import StatusMessage from './StatusMessage'
import Toast from './Toast'
import PetNameInput from './PetNameInput'
import ErrorMessage from './ErrorMessage'

const AddPetModal = ({ visible, setAddPetModal, sendTo, error, setAddPetError }) => {
  
  const [ message, setMessage ] = useState({})
  const [ petNameInput, setPetNameInput ] = useState('')
  const [ dobInput,setDobInput ] = useState('')
  const [ sexValue, setSexValue ] = useState('') 
  const [ petNameValue, setPetNameValue ] = useState('')
  const [ validFields, setValidFields ] = useState(false)
  // const [ addPetError, setAddPetError ] = useState(error)

  const closeModal = (e) => {
    e.preventDefault()
    setAddPetModal({ visible:false })
  }

  const handleSexValueChange = (e) => {
    const target = e.target
    const value = target.value
    setSexValue(value)
  }

  const handleNameInput = (e) => {
    const target = e.target
    const value = target.value
    setPetNameInput(value)
  }

  const handleDobChange = (e) => {
    const target = e.target
    const value = target.value
    setDobInput(value)
  }

  useEffect(() => {
    if(petNameValue != '' && dobInput != '' && sexValue != '') setValidFields(true)
    else setValidFields(false)
  },[petNameValue,dobInput,sexValue])

  const handleClick =(e) => {
    setAddPetError ({ status:'false' })
  }

  if( visible) {
    return (
      <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-40 backdrop-grayscale backdrop-blur-sm`} onClick={closeModal} > 
        {/* <Toast visible={visible} result={result} message={message} setToast={setToast}/> */}
        {/* {error ? <div className='absolute mt-16 bg-red-700 z-50 '>'Error adding pet</div>:null} */}
        <Form method='post' action={`${sendTo == '/pets'? '/pets':'/activity'} `} className={ ` flex flex-col gap-2 justify-start items-start text-black z-10 mt-16 bg-primary border-8 border-secondary-dark p-4 rounded-2xl w-11/12 ` } onClick={(e)=> e.stopPropagation()} >
          <legend className='flex justify-center items-center w-full font-bold mb-4 tracking-wide' >Pet Details...</legend>
          <ErrorMessage error={error} setError={setAddPetError} />
          <PetNameInput petNameValue={petNameValue} setPetNameValue={setPetNameValue}/>
          <label htmlFor='dob' className='w-full flex flex-col w-full'>
            <div className='w-1/4'> DOB: </div>
            <input type='date' name='dob' id='dob' value={dobInput} onChange={handleDobChange} className='rounded-md w-3/4  focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none px-2 h-[48px]'/>          
          </label>
          <div className='flex flex-col w-full gap-2'>
            <legend className='flex items-center'>Sex:</legend>
            <div className='flex w-3/4 gap-2 justify-end items-center text-gray-500'>
              <label htmlFor='male' className={`w-full p-2 rounded-2xl flex justify-center items-center grow border-2 ${sexValue == 'male'? 'border-secondary-dark':'border-gray-400'}`}>
                <input id='male' type='radio' name='sex' checked={sexValue == 'male'} value='male' onChange={handleSexValueChange} className='peer appearance-none hidden'/>          
                <div className={`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sexValue == 'male'? 'font-bold':''}`}> Male </div>
              </label>
              <label htmlFor='female' className={`w-full p-2 flex justify-center items-center grow rounded-2xl border-2 gap-2 ${sexValue == 'female'? 'border-secondary-dark':'border-gray-400'}`}>
                <input id='female' type='radio' name='sex' checked={sexValue == 'female'} value='female' onChange={handleSexValueChange} className=' peer appearance-none hidden'/>
                <div className= {`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sexValue == 'female'? 'font-bold':''}`}>Female</div>
              </label>
            </div>
          </div>
          <div className='w-full flex gap-12 justify-center items-center h-[48px] mt-4'>
            <button disabled={validFields == false} className='flex justify-center items-center h-[48px] bg-accent px-2 text-white font-bold rounded-md disabled:bg-gray-500 disabled:text-gray-700 disabled:font-medium' onClick={handleClick}> Submit </button>
            <button onClick={closeModal} className='flex justify-center items-center min-h-[48px] border-2 border-black px-2 rounded-md'> Cancel </button>
          </div>
        </Form>
      </div> 
    )
  }else null

}

export default AddPetModal
