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
    <div className='w-full'>
      <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } />
      {
        petsList.length == 0
        ? <div>
          Looks like there are no pets to share! Change that by clicking <Link to='/pets'>here.</Link>
          </div>
        : <div>
            <div>
              SHARE YOUR PET'S ACTIVITY
            </div>
            <div>
              Send and invite to someone you want to share your pet's activity with.
            </div>
            {
              petsList?.length > 1
                ? petsList.map( pet => {
                  return(
                    <div>
                      {pet.pet_name}
                      <input key={pet.pet_id} id={pet.pet_id} type='checkbox' value={pet.pet_id} checked={selectedPets.includes(pet.pet_id.toString())} onChange={ e => handleCheck(e)} />          
                    </div>
                  )})
                : <div>
                    {petsList[0].pet_name}
                    <input key={petsList[0].pet_id} id={petsList[0].pet_id} type='checkbox' value={petsList[0].pet_id} checked={singlePetChecked} />          
                  </div>
            }
            <input type='email' className='text-black' {...emailInviteeInput} />
            <div>
              The person you are inviting will have the same privileges to your pet, such as updating their info. Please only send this to a trusted individual.
            </div>
            <div>
              Check this box to accept the statement above and allow submission.
              <input type='checkbox' checked={checked} value='submitApproved' onChange={handleSubmissionCheck} />
            </div>
            <button disabled={!checked || petsList?.length == 0} onClick={handleInvite}>SUBMIT</button>
          </div>
          
      }    
    </div>
  )
}

export default Invite