import React, { useState } from 'react'
import { Form } from 'react-router-dom'
import StatusMessage from './StatusMessage'

const AddPetModal = ({ visible, setAddPetModal, success, error }) => {

  const [ message, setMessage ] = useState({})

  const closeModal = (e) => {
    e.preventDefault()
    setAddPetModal({ visible:false })
  }

  useEffect( () => {
    if(success || error){
        if(success) {
          setMessage({ status: success })
          const submissionCompleted = setTimeout( () => {
            setAddPetModal({ visible: false })
          }, 3000 )
          
          return clearTimeout(submissionCompleted)
        }
        if(error) setMessage({status: error})
    }
  },[success,error])

  return (
    <>
      <Form method='post' action='/activity' className={ visible? '':'hidden' }>
        <StatusMessage message={message} />
        <button onClick={closeModal}> X </button>
        <label htmlFor='name' >
          <div> Name: </div>
          <input type='text' name='name' />          
        </label>
        <label htmlFor='dob' >
          <div> DOB: </div>
          <input type='text' name='dob' />          
        </label>
        <label htmlFor='sex' >
          <div> Sex: </div>
          <input type='text' name='sex' />          
        </label>
        <button> Submit </button>
      </Form>
    </>
  )
}

export default AddPetModal
