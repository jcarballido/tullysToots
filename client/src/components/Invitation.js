import React from 'react'
import InvitationActionButtons from './InvitationActionButtons'
import PetData from './PetData'

const Invitation = ({ invitation,setActiveInvites }) => {

  const { petData, sendingOwnerUsername, invitationId } = invitation

  return(
    <div key={invitationId} className='border-2 border-blue-700 w-full'>
      {
        petData?.map( pet =>{
          return(
            <PetData pet={pet}/>
          )
        })
      }
      <div>Sent By: {sendingOwnerUsername}</div>
      <InvitationActionButtons invitationId={invitationId} setActiveInvites={setActiveInvites} />
    </div>
  )
}

export default Invitation