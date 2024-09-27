import React, { useState } from "react"

const DropdownMenu = ({ petIdArray, visible, setVisible, referencePetId, setReferencePetId }) => {

  const [ activeSelection, setActiveSelection ] = useState('')

  const selectPet = (event, petId, activeSelection) => {
    event.preventDefault()
    event.stopPropagation()
    if(activeSelection == petId) setActiveSelection('')
    else setActiveSelection(petId)
  }
  
  const updatePetReference = (e) => {
    e.preventDefault()
    setActiveSelection('')
    console.log('activeSelection:', activeSelection)
    setReferencePetId(activeSelection)
  }

  const closeMenu = (e) => {
    e.preventDefault()
    setVisible(false)
    setActiveSelection('')
  }

  return(
    <div className={`border-white border-4 bg-blue-600 flex flex-col items-center justify-center transform transition duration-100 ease-in-out ${visible ? 'scale-x-100 scale-y-100':'scale-x-0 scale-y-0'} absolute top-full z-10`}>
      {
        petIdArray
        ? petIdArray.map( pet => {
          if(pet.id == referencePetId) return null
          return(
            <button key={pet.id} onClick={(e) => selectPet(e,pet.id,activeSelection)} disabled={ activeSelection != pet.id && activeSelection} className={`flex justify-center items-center transform transition ease-in ${visible? 'opaque-100 duration-1000':'opaque-0 duration-0'} disabled:bg-gray-100 disabled:text-black`}>
              {pet.petName}
            </button>
          )})
        : null 
      }
      <button onClick={updatePetReference} disabled={ !activeSelection } className='border-2 border-green-700 disabled:bg-gray-100 disabled:text-white'>CONFIRM</button>
      <button onClick={closeMenu} className='border-2 border-red-700'>CANCEL</button>
    </div>
  )
}

export default DropdownMenu