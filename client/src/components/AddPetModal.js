import React, { useState,useEffect } from 'react'
import { Form } from 'react-router-dom'
import StatusMessage from './StatusMessage'

const AddPetModal = ({ visible, setAddPetModal, success, error }) => {
  
  const [ message, setMessage ] = useState({})
  const [ petNameInput, setPetNameInput ] = useState('')
  const [ dobInput,setDobInput ] = useState('')
  const [ sexValue, setSexValue ] = useState('') 

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

  useEffect( () => {
    if(success) {
      setMessage({ status: {success} })
      const closeModalTimeout = setTimeout( () => {
        setAddPetModal({visible: false})
      }, 3000)

      return () => clearTimeout(closeModalTimeout)
    }
  },[success])


  useEffect( () => {
    if(error){
      if(error) setMessage({status: {error}})
    }
  },[error])

  if( visible) {
    return (
      <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-50 backdrop-grayscale backdrop-blur-sm`}> 
        <Form method='post' action='/activity' className={ `transition ${visible? '':'invisible scale-0'} flex flex-col gap-5 justify-center items-start text-black z-10 mt-16 bg-primary border-4 border-secondary p-4 rounded-2xl` }>
          <legend className=''>Tell us about your pet...</legend>
          <StatusMessage message={message} />
          <label htmlFor='name' className='border-b-2 border-gray-400 w-full pb-5 flex gap-2'>
            <div> Name: </div>
            <input type='text' name='name' id='name' onChange={handleNameInput}  className='rounded-2xl w-full'/>          
          </label>
          <label htmlFor='dob' className='border-b-2 border-gray-400 w-full pb-5 flex items-center gap-2'>
            <div> DOB: </div>
            <input type='date' name='dob' id='dob' value={dobInput} onChange={handleDobChange} className=' grow rounded-2xl'/>          
          </label>
          <div className='flex justify-center items-center gap-12 w-full'>
            <legend className='flex justify-center items-center'>Sex:</legend>
            <label htmlFor='male' className=' min-w-[48px] p-2 rounded-2xl border-2 border-accent flex justify-center items-center'>
              <input id='male' type='radio' name='sex' checked={sexValue == 'male'} value='male' onChange={handleSexValueChange} className='appearance-none peer invisible'/>          
              <div className='peer-checked:bg-accent flex justify-center items-center'> Male </div>
            </label>
            <label htmlFor='female' className='rounded-2xl border-2 border-accent min-w-[48px] p-2 flex justify-center items-center'>
              <input id='female' type='radio' name='sex' checked={sexValue == 'female'} value='female' onChange={handleSexValueChange} className='appearance-none peer invisible'/>
              <div className=' peer-checked:bg-accent flex justify-center items-center'>Female</div>
            </label>
          </div>
          <div className='w-full flex gap-12 justify-center items-center h-[48px]'>
            <button className='flex justify-center items-center min-h-[48px]'> Submit </button>
            <button onClick={closeModal} className='flex justify-center items-center min-h-[48px]'> Cancel </button>
          </div>
        </Form>
      </div> 
    )
  }else {return null}

}

export default AddPetModal
