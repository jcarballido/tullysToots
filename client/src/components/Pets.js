import React, { useEffect, useState } from 'react'
import { Link, Outlet, useActionData, useLoaderData, useOutletContext } from 'react-router-dom'
import { axiosPrivate } from '../api/axios'
import Pet from './Pet'
import Toast from './Toast'
import NewPetModal from './NewPetModal'
import useAxiosPrivate from '../hooks/useAxiosPrivate'

function Pets({ no }) {

  const axiosPrivate = useAxiosPrivate()
  const actionData = useActionData()
  // const loaderData = useLoaderData()
  const [petsArray, setPetsArray, setNewPetModal, unlinkPetModal, setUnlinkPetModal, editPetModal, setEditPetModal,addPetModal, setAddPetModal] = useOutletContext()
  
  // const [ toast, setToast ] = useState({visible:null, result:'', message:''})
  
  // const [ editPetsArray, setEditPetsArray ] = useState([])
  
  const handleEditMode = (e,petId) => {
    e.preventDefault()
    if(editMode?.state){
      return
    }else{
      setEditMode({state:true,petId})
    }
  }

  const addPet = (e) => {
    e.preventDefault()
    setAddPetModal({visible:true})
  }

  const newPetInProcess = () => {
    const petIdsArray= petsArray.map( pet => {
      return pet.id
    })
    const newPetIncluded = petIdsArray.includes('new')
    return newPetIncluded
  }


  // useEffect( () => {
  //   if(loaderData?.success){
  //     setPetsArray([...loaderData.success])
  //   }else{
  //     console.log('Error in loader data: ',loaderData?.error)
  //   }
  // },[loaderData])

  useEffect( () => {
    const getPets = async() => {
      try{
        const result = await axiosPrivate.get('/account/getPets')
        console.log('Result from getting pets in useEffect: ', result.data)
        // return {success: result}
        setPetsArray([...result.data])
      }catch(e){
        // return {error: e}
        console.log('Error in Pets useEffect getting pets: ', e)
      }
    }

    getPets()
  },[])

  useEffect( () => {
    if(actionData?.status == 'success'){
      console.log('pet added!')
      console.log('Action data Updated array:', actionData.updatedPetIdArray)
      setPetsArray(actionData.updatedPetIdArray)
      setAddPetModal({visible:false})
    }
    if(actionData?.status == 'error'){
      console.log('Error adding pet')
    }
  },[ actionData ])

  // console.log
  
  return (
    <div className='w-full h-full flex flex-col items-center overflow-hidden'>
      {/* <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } />        */}
      {/* <NewPetModal newPetModal={newPetModal} setNewPetModal={setNewPetModal} setPetsArray={setPetsArray} /> */}
      <div className='w-full flex items-center font-bold mb-2 pl-2 text-xl'>Pets</div>
      <div className='w-full grow flex flex-col overflow-y-auto'>
        {petsArray?.map( (pet, index) => {
          // if(editMode?.petId == pet.pet_id){
            return(
              <Pet pet={pet} disabled={false} handleEditMode={handleEditMode} setPetsArray={setPetsArray} index={index} unlinkPetModal={unlinkPetModal} setUnlinkPetModal={setUnlinkPetModal} editPetModal={editPetModal} setEditPetModal={setEditPetModal} /> 
            )
        //   }else{
        //     return(
        //       <Pet pet={pet} editMode={editMode} disabled={true} handleEditMode={handleEditMode} setPetsArray={setPetsArray} setEditMode={setEditMode} /> 
        //     )
        //   }
          
        // 
        }
        )
        }

      </div>
      <button disabled={newPetInProcess()} onClick={addPet} className='flex justify-center items-center rounded-xl bg-accent px-2 text-white max-w-max  my-4'>Add a Pet</button>
    </div>
  )
}

export const loader = async() => {
  return null
}

export const action = async({ request }) => {
  const formData = await request.formData()
  const name = formData.get('name')
  const dob = formData.get('dob')
  const sex = formData.get('sex')

  const petInfo = { name,dob, sex }

  try {
    const response = await axiosPrivate.post('/account/addPet', petInfo)
    const { status, updatedPetIdArray } = response.data
    return {status, updatedPetIdArray }
  } catch (err) {
    console.log('Error attempting to add a pet: ', err)
    const { status, message } = err.response.data
    return { status, message }
  }
}

export default Pets