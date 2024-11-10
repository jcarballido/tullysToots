import React, { useEffect, useState } from 'react'
import { Form } from 'react-router-dom'
import { axiosPrivate } from '../api/axios'
import PetNameInput from './PetNameInput'
import ErrorMessage from './ErrorMessage'

const EditPetModal = ({ editPetModal, setEditPetModal, setPetsArray, error, setPetError }) => {

  const petInfo = {...editPetModal.pet}

  const [ name, setName ] = useState('' )
  const [ dob, setDob ] = useState( '')
  const [ sex, setSex ] = useState( '')
  // const [ petInfo, setPetInfo ] = useState({})
  const [ validFields, setValidFields ] = useState(false)
  useEffect(() => {
    if(name != '' && dob != '' && sex != '') setValidFields(true)
    else setValidFields(false)
  },[name,dob,sex])


  useEffect( () => {
    if(editPetModal?.visible && Object.keys(editPetModal.pet).length > 0){
      setName(petInfo.pet_name)
      const dobString = petInfo.dob
      const dobParsed = dobString.split('T')
      const dobDate = dobParsed[0]
      setDob(dobDate)
      setSex(petInfo.sex.trim())

    }
    // if(editPetModal?.visible && Object.keys(editPetModal.pet).length > 0){
    //   const dobString = editPetModal.pet.dob
    //   const dobParsed = dobString.split('T')
    //   const dobDate = dobParsed[0]
    //   const sex = editPetModal.pet.sex.trim()
    //   console.log('Pet info updated to:', editPetModal.pet['pet_name'],' ',dobDate,' ',sex)
    //   setPetInfo({name:editPetModal.pet['pet_name'],dob:dobDate,sex})
    // }
  },[editPetModal])

  const captureChanges = (referenceObj, objToCompare) => {
    return Object.keys(referenceObj).reduce((acc, key) => {
      const capturedKey = referenceObj[key];
      const comparisonKey = objToCompare[key];
      
      if (JSON.stringify(capturedKey) !== JSON.stringify(comparisonKey)) {
        acc[key] = comparisonKey;
      }
      
      return acc;
    }, {});
 }

  const handleNameChange = (e) => {
    const target = e.target
    const value = target.value
    setName(value)
  }

  const handleDobChange = (e) => {
    const target = e.target
    const value = target.value
    setDob(value)
  }

  const handleSexValueChange = (e) => {
    const target = e.target
    const value = target.value
    setSex(value)
  }
  
  const handleUpdate = async(e) => {
    e.preventDefault()
    setPetError({ status: 'false' })
    const dobString = petInfo.dob
    const dobParsed = dobString.split('T')
    const dobDate = dobParsed[0]
    const originalData = {'pet_name':petInfo.pet_name,dob:dobDate,sex:petInfo.sex.trim()}
    const updates = captureChanges(originalData,{'pet_name':name,dob,sex})
    const newObj = {...petInfo,...updates}
    console.log('Object to send:', newObj)
    try {
      const result = await axiosPrivate.put('/account/updatePet', {...newObj})
      // console.log('New data sent')
      setPetsArray([...result.data])
      setEditPetModal({ visible:false, pet:null })
    } catch (error) {
      console.log('Error attempting to update:', error)
      setPetError({ status:'true',message:'Pet details are not unique. Cannot update at this time.' })
    }
  }

  const closeModal = () => {
    setEditPetModal({ visible:false, pet:null })
  }

  if( editPetModal?.visible && Object.keys(editPetModal.pet).length > 0) {
    return (
      <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-40 backdrop-grayscale backdrop-blur-sm`}> 
        {/* <Toast visible={visible} result={result} message={message} setToast={setToast}/> */}
        {/* {error ? <div className='absolute mt-16 bg-red-700 z-50 '>'Error adding pet</div>:null} */}

        <Form className={ ` flex flex-col gap-2 justify-start items-start text-black z-10 mt-16 bg-primary border-8 border-secondary-dark p-4 rounded-2xl w-11/12 ` }>
          {/* <label htmlFor='name' className='border-b-2 border-gray-400 pb-5 flex justify-between items-center flex-nowrap w-full' >
            <div className='w-1/4 '> Name: </div>
            <input type='text' name='name' id='name' onChange={handleNameChange}  className='rounded-md w-3/4 focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none  px-2' value={name} />          
          </label> */}
          <ErrorMessage error={error} setError={setPetError} />
          <PetNameInput petNameValue={name} setPetNameValue={setName}/>
          <label htmlFor='dob' className=' w-full flex flex-col'>
            <div className='w-1/4'> DOB: </div>
            <input type='date' name='dob' id='dob' value={dob} onChange={handleDobChange} className='rounded-md w-3/4  focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none px-2'/>          
          </label>
          <div className='flex flex-col w-full '>
            <legend className='flex'>Sex:</legend>
            <div className='flex w-3/4 gap-2 justify-end items-center text-gray-500'>
              <label htmlFor='male' className={`w-full p-2 rounded-2xl flex justify-center items-center grow border-2 ${sex == 'male'? 'border-secondary-dark':'border-gray-400'}`}>
                <input id='male' type='radio' name='sex' checked={sex == 'male'} value='male' onChange={handleSexValueChange} className='peer appearance-none hidden'/>          
                <div className={`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sex == 'male'? 'font-bold':''}`}> Male </div>
              </label>
              <label htmlFor='female' className={`w-full p-2 flex justify-center items-center grow rounded-2xl border-2 gap-2 ${sex == 'female'? 'border-secondary-dark':'border-gray-400'}`}>
                <input id='female' type='radio' name='sex' checked={sex == 'female'} value='female' onChange={handleSexValueChange} className=' peer appearance-none hidden'/>
                <div className= {`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sex == 'female'? 'font-bold':''}`}>Female</div>
              </label>
            </div>
          </div>
          <div className='w-full flex gap-12 justify-center items-center h-[48px] mt-4'>
            <button disabled={validFields == false} className='flex justify-center items-center h-[48px] bg-accent px-2 text-white font-bold rounded-md disabled:bg-gray-500 disabled:text-gray-700 disabled:font-medium'  onClick={(e) => {handleUpdate(e,editPetModal.pet)}}> Submit </button>
            <button onClick={closeModal} className='flex justify-center items-center min-h-[48px] border-2 border-black px-2 rounded-md'> Cancel </button>
          </div>
        </Form>
      </div> 
    )
  }else null
}

export default EditPetModal