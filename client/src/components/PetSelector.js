import React, { useState, useEffect } from 'react'
import DropdownMenu from './DropdownMenu'

const PetSelector = ({ petIdArray, setReferencePetId }) => {
  const [ name, setName ] = useState('')
  const [ visible, setVisible ] = useState(true)

  useEffect( () => {
    const activePetId = localStorage.getItem('referencePetId')
    const petIdString = activePetId.replace(/^"|"$/g, '');
    const petId = parseInt(petIdString)
    
    if(activePetId){
      const activePetRecord = petIdArray.filter( petRecord => petRecord.id == petId)
      
      const activePetName = activePetRecord[0]
      if(activePetName) setName(activePetName['petName'])
      // console.log('Active pet name: ', activePetName.petName)
      // setName(activePetName)
    }
  },[ petIdArray ])

  const toggleDropdownVisibility = (e) => {
    e.preventDefault()
    setVisible(!visible)
  }

  return(
    <div className='w-full border-green-700 border-2 flex justify-center items-center relative' onClick={toggleDropdownVisibility}>
      {name ? `${name}'s Activity`:''}
      <DropdownMenu petIdArray={petIdArray} visible={visible} setVisible={setVisible} setReferencePetId={setReferencePetId} />
    </div>
      
    
  )
}

export default PetSelector