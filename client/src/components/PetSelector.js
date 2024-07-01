import React, { useState, useEffect } from 'react'
import DropdownMenu from './DropdownMenu.js'

const PetSelector = ({ petIdArray, referencePetId, setReferencePetId }) => {
  const [ name, setName ] = useState('')
  const [ visible, setVisible ] = useState(false)

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
    setVisible(!visible)
  }

  return(
    <div className='w-full border-green-700 border-2 flex justify-center items-center relative' onClick={toggleDropdownVisibility}>
      {name ? `${name}'s Activity`:''}
      <DropdownMenu petIdArray={petIdArray} visible={visible} setVisible={setVisible} referencePetId={referencePetId} setReferencePetId={setReferencePetId} />
    </div>
      
    
  )
}

export default PetSelector