import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLoaderData } from 'react-router-dom'
import { axiosPrivate } from '../api/axios'
import Pet from './Pet'
import Toast from './Toast'
import NewPetModal from './NewPetModal'
import useAxiosPrivate from '../hooks/useAxiosPrivate'

function Pets() {

  const axiosPrivate = useAxiosPrivate()
  // const loaderData = useLoaderData()
  const [ petsArray, setPetsArray ] = useState([])
  const [ editMode, setEditMode ] = useState({state:false, petId:null})
  const [ toast, setToast ] = useState({visible:null, result:'', message:''})
  const [ newPetModal, setNewPetModal ] = useState({ visible:false })
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
    setNewPetModal({visible:true})
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
        console.log('Result from getting pets in useEffect: ', result.data.success)
        // return {success: result}
        setPetsArray([...result.data.success])
      }catch(e){
        // return {error: e}
        console.log('Error in Pets useEffect getting pets: ', e)
      }
    }

    getPets()
  },[])

  // console.log
  
  return (
    <div className='w-full'>
      <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } />       
      <NewPetModal newPetModal={newPetModal} setNewPetModal={setNewPetModal} />
      Pets
      {petsArray?.map( pet => {
        if(editMode?.petId == pet.pet_id){
          return(
            <Pet pet={pet} editMode={editMode} disabled={false} handleEditMode={handleEditMode} setPetsArray={setPetsArray} setEditMode={setEditMode} /> 
          )
        }else{
          return(
            <Pet pet={pet} editMode={editMode} disabled={true} handleEditMode={handleEditMode} setPetsArray={setPetsArray} setEditMode={setEditMode} /> 
          )
        }
        
      })}
      <button disabled={newPetInProcess()} onClick={addPet}>Add a Pet</button>
    </div>
  )
}

export const loader = async() => {
  return null
}

export default Pets