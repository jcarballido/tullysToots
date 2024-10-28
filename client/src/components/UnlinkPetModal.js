import React from 'react'
import { axiosPrivate } from '../api/axios'

const UnlinkPetModal = ({ unlinkPetModal, setUnlinkPetModal, setPetsArray }) => {

  const closeModal = (e) => {
    e.preventDefault()
    setUnlinkPetModal({ visible:false, petId:null })
  }

  const unlinkPet = async(e,petIdToUnlink) => {
    e.preventDefault()
    try {
      console.log('Pet ID passed into modal:', petIdToUnlink)
      const result = await axiosPrivate.patch('/account/unlinkPet', {petId: petIdToUnlink})
      console.log('**UnlinkPetModal** Result from clearing pet:', result.data)
      localStorage.setItem('referencePetId',null)
      setPetsArray([ ...result.data ])
      setUnlinkPetModal({ visible:false, petId:null })
    } catch (error) {
      console.log('Error unlinking pet:', error)
    }
  }

  if(unlinkPetModal?.visible){
    return (
      <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-40 backdrop-grayscale backdrop-blur-sm`}onClick={closeModal}> 
        <div className='border-2 border-red-700 bg-primary w-10/12 rounded-xl flex flex-col gap-4 py-4 items-center' onClick={(e) => e.stopPropagation()}>
          <div className='flex flex-col justify-center items-center w-11/12'>
            <div className='flex items-center justify-center font-bold'>This will clear all related pet data from your account.</div>
            <div className='italic'>This cannot be undone.</div>
          </div>
          <div className='flex justify-center items-center gap-4'>
            <button onClick={(e) => unlinkPet(e,unlinkPetModal.petId)} className={` bg-red-500 rounded-xl p-2 font-bold flex justify-center items-center`}>
              CONFIRM  
            </button>
            <div onClick={closeModal} className=' flex justify-center items-center p-2 border-2 border-black rounded-xl'>
              CANCEL  
            </div>
          </div>
        </div>
      </div>
  )}else {{return null}}
}

export default UnlinkPetModal