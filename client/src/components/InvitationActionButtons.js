import React, { useState } from 'react'


const InvitationActionButtons = ({ invitationId }) => {

  const [ inviteStatusUpdates, setInviteStatusUpdates ] = useState([])

  const handleAccept = async(e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/account/acceptInvitation', { invitationId } )
      return console.log('Response data: ', response.data)
    } catch (error) {
      return console.log('Error with request to add new pets:', error)
    }
  } 

  const handleReject = async(e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/account/rejectInvitation', { invitationId } )
      return console.log('Response data: ', response.data)
    } catch (error) {
      return console.log('Error with request to reject invitation:', error)
    }
  }

  return(
    <div>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
    </div>
  )
}

export default InvitationActionButtons