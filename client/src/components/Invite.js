import React, { useEffect, useState } from 'react'
import useTextInput from '../hooks/useTextInput'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import {Link} from 'react-router-dom'
import Toast from './Toast'

function Invite({ }) {

  const emailInviteeInput = useTextInput('')
  const axiosPrivate = useAxiosPrivate()
  const [ checked, setChecked ] = useState(false)
  const [ toast, setToast ] = useState({ visible:false,result:null,message:'' })
  const [ selectedPets, setSelectedPets ] = useState([])
  const [ petsList, setPetsList ] = useState([])
  const [ singlePetChecked, setSinglePetChecked ] = useState(true)

  useEffect(() => {
    const getPets = async () => {
      try{
        const result = await axiosPrivate.get('/account/getPets')
        console.log('Result from querying for pets: ', result)
        const data = result.data
        setPetsList([...data])
      }catch(e){
        console.log('Error getting pets: ', e)
      }
    }

    getPets()

  },[])

  useEffect(() => {
    if(petsList && petsList.length == 1){
      setSelectedPets([petsList[0].pet_id])
    }
  },[petsList])

  const handleInvite = async () => {
    console.log('Selected pets:',selectedPets)
    try{
      const result = await axiosPrivate.post('/account/sendInvite',{email: emailInviteeInput.value,petsToShareArray: selectedPets})
      
      setToast({ visible:true, result:'+', message: result.data.message })
    }catch(e){
      
      console.log('Error sending invite: ',e)
      setToast({ visible:true, result:'x', message: e.response.data.error })
      return
    }
  }

  const handleCheck = (e) => {
    console.log(`${e.target.id} was clicked`)
    const target = e.target
    const petId = target.id
    console.log("Pet ID: ", petId)
    if(selectedPets.includes(petId)) return setSelectedPets(previousArray => {
      const newArray = previousArray.filter( petIdElement => petIdElement != petId )
      return newArray
    })
    else return setSelectedPets( previousArray => [...previousArray, petId])
  }

  const handleSubmissionCheck = () => {
    setChecked(!checked)
  }

  return (
    <div className='w-full text-xl overflow-y-auto'>
      {/* <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } /> */}
      {
        petsList.length == 0
        ? <div>
          Looks like there are no pets to share! Change that by clicking <Link to='/pets'>here.</Link>
          </div>
        : <div>
            <div className='w-full flex items-center font-bold mb-2  text-xl mt-4'>
              Share Your Pet's Activity
            </div>
            <div className='my-4'>
              Send and invite to someone you want to share your pet's activity with.
            </div>
            <div className='my-4'>
              The person you are inviting will have your same privileges to your pet, such as updating their info. <b>Please only send this to a trusted individual(s).</b>
            </div>
            <label>
              Check this box to accept the statement above and allow submission.
              <input type='checkbox' className='invisible peer appearance-none' checked={checked} value='submitApproved' onChange={handleSubmissionCheck} />
              <div className='max-w-min italic p-2 rounded-xl border-2 border-gray-600 text-gray-700 peer-checked:bg-green-500 peer-checked:text-black flex items-center justify-center'>
                <div>Accept</div>
              </div>
            </label>
            <div className='font-bold my-4'>Select the Pet(s) to Share...
              <div className='flex flex-col gap-4 items-start'>
              {
                petsList?.length > 1 
                  ? petsList?.map( pet => {
                    // if(pet.id == referencePetId) return null
                    return(
                      <label key={pet.pet_id} htmlFor={`${pet.pet_id}`} className="flex justify-start items-center w-full">
                        <input type='checkbox' name='pets' value={pet.pet_id} id={`${pet.pet_id}`} onChange={(e)=> handleCheck(e) } checked={selectedPets.includes(pet.pet_id.toString())} className={`appearance-none peer invisible`} />
                        <div className=" h-[48px] border-2 peer-checked:bg-accent peer-checked:border-0 peer-checked:text-white border-gray-700 rounded-2xl flex justiy-center items-center px-4">{pet.pet_name}</div>
                      </label>)})
                  : 
                      <div className='font-normal'>
                        <input key={petsList[0].pet_id} id={petsList[0].pet_id} type='checkbox' value={petsList[0].pet_id} checked={singlePetChecked} />          
                        <div className=" h-[48px] border-2 peer-checked:bg-accent peer-checked:border-0 peer-checked:text-white border-gray-700 rounded-2xl flex justiy-center items-center px-4">{petsList[0].pet_name}</div>
                      </div>
                
              }
              </div>
            {/* {
              petsList?.length > 1
                ? petsList.map( pet => {
                  return(
                    <div className='font-normal'>
                      {pet.pet_name}
                      <input key={pet.pet_id} id={pet.pet_id} type='checkbox' value={pet.pet_id} checked={selectedPets.includes(pet.pet_id.toString())} onChange={ e => handleCheck(e)} />          
                    </div>
                  )})
                : <div className='font-normal'>
                    {petsList[0].pet_name}
                    <input key={petsList[0].pet_id} id={petsList[0].pet_id} type='checkbox' value={petsList[0].pet_id} checked={singlePetChecked} />          
                  </div>
            } */}
            </div>
            <div className='font-bold my-4'>Send Invite to This Email...</div>
            <input type='email' className='px-2 w-full text-black border-none outline-none ring-4 ring-gray-300 rounded-lg h-[40px] focus:ring-accent' {...emailInviteeInput} />
            <button disabled={!checked || petsList?.length == 0} onClick={handleInvite} className='flex justify-center items-center h-[48px] bg-accent px-2 rounded-md text-white text-lg font-bold max-w-min my-6 disabled:bg-gray-500'>SUBMIT</button>
          </div>
          
      }    
    </div>
  )
}

export default Invite