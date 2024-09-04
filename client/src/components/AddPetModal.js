import React from 'react'
import { Form } from 'react-router-dom'

const AddPetModal = ({ visible, setAddPetModal }) => {

  const closeModal = (e) => {
    e.preventDefault()
    setAddPetModal({ visible:false })
  }

  return (
    <>
      <Form method='post' action='/activity' className={ visible? '':'hidden' }>
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
