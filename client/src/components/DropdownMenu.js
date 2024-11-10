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
    <div className={`border-primary border-4 bg-secondary flex flex-col gap-4 rounded-2xl items-center justify-start transform transition duration-1000 ease-in-out ${visible ? 'scale-100 ':'scale-0'}  w-3/4 z-10 p-4  overflow-auto my-8`} onClick={(e)=>e.stopPropagation()}>
      <div className="font-bold mb-4">
        Switch Pets?
      </div>
      <div className='flex flex-wrap max-w-full gap-4 justify-center' >
        {
          petIdArray?.map( pet => {
            if(pet.pet_id == referencePetId) return null
            return(
              <label key={pet.pet_id} htmlFor={`${pet.pet_id}`} className="flex justify-center items-center">
                <input type='radio' name='pets' value={pet.pet_id} id={`${pet.pet_id}`} onChange={(e)=> selectPet(e) } checked={activeSelection == pet.pet_id} className={`appearance-none peer invisible`} />
                <div className=" h-[48px] border-2 peer-checked:bg-accent peer-checked:border-0 peer-checked:text-white border-gray-700 rounded-2xl flex justiy-center items-center px-4">{pet.pet_name}</div>
              </label>
            )})
        }
      </div>
      <div className="flex w-9/10 flex-col gap-2">
        <div className="flex justify-center items-center w-full text-black mt-4" onClick={openAddPetModal}>
          Add a pet
        </div>
        <Link to='/pets' state={{from:location.pathname}} className="flex justify-center items-center w-full text-black mb-4">
          Edit pets
        </Link>
        <div className="flex gap-6 justify-center items-center w-full ">
          <button disabled={ !activeSelection } onClick={updatePetReference} className="flex flex-col justify-center items-center disabled:bg-gray-500 disabled:text-black bg-accent p-2 rounded-xl max-h-min basis-1/2">
            <img className='  h-[30px] flex items-center justify-center' src={ activeSelection ? check:check_black }/>
            <div className={`flex justify-center items-center ${ activeSelection? 'text-white':'text-black' } `}>Confirm</div>
          </button>
          <button onClick={closeMenu} className="flex flex-col border-2 border-primary rounded-xl p-2 justify-center items-center text-gray-900 max-h-min grow">
            <img className=' h-[30px] flex items-center justify-center' src={cancel}/>
            <div className="flex justify-center items-center">Cancel</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DropdownMenu