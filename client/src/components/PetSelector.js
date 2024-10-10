import React, { useState, useEffect } from 'react'
import DropdownMenu from './DropdownMenu.js'

const PetSelector = ({ petIdArray, referencePetId, setReferencePetId, switchPetModal, setSwitchPetModal,addPetModal, setAddPetModal }) => {
  const [ name, setName ] = useState('')

  useEffect( () => {
    // const activePetId = localStorage.getItem('referencePetId')
    // const petIdString = activePetId? activePetId.replace(/^"|"$/g, ''):null
    // const petId = petIdString? parseInt(petIdString):null
    // console.log('petIdArray: ',petIdArray)
    if(referencePetId && petIdArray){
      const activePetRecord = petIdArray.filter( petRecord => {
        return petRecord.id == referencePetId
      })
      // console.log('activePetRecord: ',activePetRecord)
      const activePetName = activePetRecord[0]
      // console.log('Active pet name: ', activePetName)
      if(activePetName) setName(activePetName['petName'])
      // setName(activePetName)
    }
  },[ referencePetId, petIdArray ])

  const toggleDropdownVisibility = (e) => {
    e.preventDefault()
    setSwitchPetModal({visible:false})
  }

  if(switchPetModal.visible == false) return null

  return(
    <div className={`absolute inset-0 flex flex-col justify-start items-center text-black font-Fredoka text-2xl z-30 backdrop-grayscale backdrop-blur-sm`}>
      <DropdownMenu petIdArray={petIdArray} visible={switchPetModal.visible} setSwitchPetModal={setSwitchPetModal} referencePetId={referencePetId} setReferencePetId={setReferencePetId} addPetModal={addPetModal} setAddPetModal={setAddPetModal}/>
    </div>
      
    
  )
}

export default PetSelector