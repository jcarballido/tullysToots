import React, { useState,useEffect } from 'react'
import { Form } from 'react-router-dom'
import StatusMessage from './StatusMessage'

const AddPetModal = ({ visible, setAddPetModal, success, error }) => {

  console.log('AddPetModal visible prop:', visible)

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
      <>
        <Form method='post' action='/activity' className={ `transition ${visible? 'border-4 border-green-700':'invisible scale-0'} text-black` }>
          <legend>Pet Details</legend>
          <StatusMessage message={message} />
          <button onClick={closeModal}> X </button>
          <label htmlFor='name' >
            <div> Name: </div>
            <input type='text' name='name' id='name' onChange={handleNameInput}/>          
          </label>
          <label htmlFor='dob' >
            <div> DOB: </div>
            <input type='date' name='dob' id='dob' value={dobInput} onChange={handleDobChange} />          
          </label>
          <div>
            <input id='male' type='radio' name='sex' checked={sexValue == 'male'} value='male' onChange={handleSexValueChange}/>          
            <label htmlFor='male' >
              <div> Male </div>
            </label>
          </div>
          <div>
            <input id='female' type='radio' name='sex' checked={sexValue == 'female'} value='female' onChange={handleSexValueChange}/>
            <label htmlFor='female'>
              <div>Female</div>
            </label>
          </div>
          <button> Submit </button>
        </Form>
      </>
    )
  }else {return null}

}

export default AddPetModal
