import React, { useState } from 'react'
import useTextInput from '../hooks/useTextInput'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Toast from './Toast'

function Invite() {

  const emailInviteeInput = useTextInput('')
  const axiosPrivate = useAxiosPrivate()
  const [ checked, setChecked ] = useState(false)
  const [ toast, setToast ] = useState({ visible:false,result:null,message:'' })
  const [ selectedPets, setSelectedPets ] = useState([])

  const handleInvite = async () => {
    try{
      const result = await axiosPrivate.post('/account/sendInvite',{})
      setToast({ visible:true, result, message: result.message })
    }catch(e){
      console.log('Error sending invite: ',e)
      return
    }
  }

  const handleCheck = (e) => {
    const target = e.target
    const petId = target.id
    if(selectedPets.includes(petId)) return setSelectedPets(previousArray => {
      const newArray = previousArray.filter( petIdElement => petIdElement != petId )
      return newArray
    })
    else return setSelectedPets( previousArray => [...previousArray, petId])
  }

  return (
    <div className='w-full'>
      <Toast visible={toast.visible} result={toast.result} message={toast.message} setToast={ setToast } />
      <div>
        SHARE YOUR PET'S ACTIVITY
      </div>
      <div>
        Send and invite to someone you want to share your pet's activity with.
      </div>
      {
        petsList.map( pet => {
          <input key={pet.pet_id} id={pet.pet_id} type='checkbox' value={pet.pet_id} checked={selectedPets.includes(pet.pet_id)} onChange={ e => handleCheck(e)} />
        })
      }
      <input type='text' {...emailInviteeInput} />
      <div>
        The person you are inviting will have the same privileges to your pet, such as updating their info. Please only send this to a trusted individual.
      </div>
      <div>
        Check this box to accept the statement above and allow submission.
        <input type='checkbox' checked={checked} value='submitApproved' onChange={handleCheck} />
      </div>
      <button disabled={!checked} onClick={handleInvite}>SUBMIT</button>
      {/*History section*/}
    </div>
  )
}

export default Invite