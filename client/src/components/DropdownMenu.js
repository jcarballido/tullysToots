import React, { useState } from "react"
import check_black from '../media/check-black.svg'
import check from '../media/check.svg'
import cancel from '../media/cancel.svg'
import { Link } from "react-router-dom"

const DropdownMenu = ({ petIdArray, visible, setSwitchPetModal, referencePetId, setReferencePetId, addPetModal, setAddPetModal }) => {

  const [ activeSelection, setActiveSelection ] = useState(null)
  console.log('Active selection:',activeSelection)

  const selectPet = (event) => {
    console.log('Pet selected:', event.target.value)
    event.stopPropagation() 
    setActiveSelection(activeSelection == event.target.value ? null:event.target.value)
  }
  
  const updatePetReference = (e) => {
    e.preventDefault()
    setActiveSelection(null)
    setSwitchPetModal({visible:false})
    console.log('activeSelection:', activeSelection)
    setReferencePetId(activeSelection)
  }

  const closeMenu = (e) => {
    e.preventDefault()
    setSwitchPetModal({visible:false})
    setActiveSelection(null)
  }

  const openAddPetModal = () => {
    setAddPetModal({ visible:true })
  }

  return(
    <div className={`border-primary border-4 bg-secondary flex flex-col gap-4 rounded-2xl items-center justify-start transform transition duration-1000 ease-in-out ${visible ? 'scale-100 ':'scale-0'}  w-3/4 z-10 p-4  overflow-auto my-8`}>
      <div className="font-bold mb-4">
        Switch Pets?
      </div>
      <div className='flex flex-wrap max-w-full gap-4 justify-center' >
        {
          petIdArray?.map( pet => {
            if(pet.id == referencePetId) return null
            return(
              <label key={pet.id} htmlFor={`${pet.id}`} className="flex justify-center items-center">
                <input type='radio' name='pets' value={pet.id} id={`${pet.id}`} onChange={(e)=> selectPet(e) } checked={activeSelection == pet.id} className={`appearance-none peer invisible`} />
                <div className=" h-[48px] border-2 peer-checked:bg-accent peer-checked:border-0 peer-checked:text-white border-gray-700 rounded-2xl flex justiy-center items-center px-4">{pet.petName}</div>
              </label>
            )})
        }
      </div>
      <div className="flex min-w-max flex-col gap-6 mt-4">
        <div className="flex justify-center items-center w-full bg-primary text-gray-900 rounded-2xl" onClick={openAddPetModal}>
          Add a pet
        </div>
        <Link to='/pets' className="flex justify-center items-center w-full bg-primary text-gray-900 rounded-2xl">
          Edit pets
        </Link>
        <div className="flex gap-6 justify-center items-center w-full">
          <button disabled={ !activeSelection } onClick={updatePetReference} className="flex flex-col justify-center items-center disabled:bg-gray-500 disabled:text-black bg-accent p-2 rounded-xl ">
            <img className=' h-[48px] flex items-center justify-center' src={ activeSelection ? check:check_black }/>
            <div className={`flex justify-center items-center ${ activeSelection? 'text-white':'text-black' } `}>Confirm</div>
          </button>
          <button className="flex flex-col bg-primary rounded-xl p-2 justify-center items-center text-gray-900">
            <img onClick={closeMenu} className=' h-[48px] flex items-center justify-center' src={cancel}/>
            <div className="flex justify-center items-center">Cancel</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DropdownMenu