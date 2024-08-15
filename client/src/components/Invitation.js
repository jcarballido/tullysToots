import React from 'react'

const Invitation = ({ invitation }) => {

  const { petDataArray, senderUsername, invitationId } = invitation

  return(
    <div>
      {
        petDataArray.map( pet =>{
          return(
            <PetData pet={pet}/>
          )
        })
      }
      <div>Sent By: {senderUsername}</div>
      <InvitationActionButtons invitationId={invitationId} />
    </div>
  )
}

export default Invitation