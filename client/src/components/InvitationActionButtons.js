import React, { useState } from 'react'


const InvitationActionButtons = ({ invitationId }) => {

  const [ inviteStatusUpdates, setInviteStatusUpdates ] = useState([])

  const handleAccept = async(e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/account/acceptInvitation', { invitationId } )
      
    } catch (error) {
      
    }
  } 

  const handleReject = async(e) => {

  }

  return(
    <div>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  )
}

export default InvitationActionButtons