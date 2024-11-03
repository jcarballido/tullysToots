import React from 'react'
import InvitationActionButtons from './InvitationActionButtons'
import PetData from './PetData'

const Invitation = ({ invitation,setActiveInvites, index }) => {

  const { petData, sendingOwnerUsername, invitationId } = invitation

  return(
    <div key={invitationId} className={`flex flex-col justify-between text-black w-full  rounded-lg my-2 p-2 items-start ${index % 2 == 0 ? 'bg-secondary-light':'bg-secondary'} shadow-xl`}>
      {
        petData?.map( pet =>{
          return(
            <PetData pet={pet}/>
          )
        })
      }
      <div className='font-bold mb-4'>Sent By: {sendingOwnerUsername}</div>
      <InvitationActionButtons invitationId={invitationId} setActiveInvites={setActiveInvites} />
    </div>
  )
}

export default Invitation