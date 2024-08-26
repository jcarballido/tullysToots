import React, { useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate' 


const InvitationActionButtons = ({ invitationId,setActiveInvites }) => {

  const axiosPrivate = useAxiosPrivate()
  const [ inviteStatusUpdates, setInviteStatusUpdates ] = useState([])

  const handleAccept = async(e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/account/acceptInvitation', { invitationId } )
      console.log('Response data: ', response.data)
      const result = response.data
      setActiveInvites([...result])   
    } catch (error) {
      return console.log('Error with request to add new pets:', error)
    } 
  } 

  const handleReject = async(e) => {
    e.preventDefault()
    try {
      const response = await axiosPrivate.post('/account/rejectInvite', { invitationId } )
      console.log('Response data: ', response.data)
      const result = response.data
      setActiveInvites([...result])
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