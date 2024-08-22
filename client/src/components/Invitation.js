import React from 'react'
import InvitationActionButtons from './InvitationActionButtons'
import PetData from './PetData'

const Invitation = ({ invitation,setActiveInvites }) => {

  const { petDataArray, senderUsername, invitationId } = invitation

  return(
    <div key={invitationId} className='border-2 border-blue-700 w-full'>
      {
        petDataArray.map( pet =>{
          return(
            <PetData pet={pet}/>
          )
        })
      }
      <div>Sent By: {senderUsername}</div>
      <InvitationActionButtons invitationId={invitationId} setActiveInvites={setActiveInvites} />
    </div>
  )
}

export default Invitation