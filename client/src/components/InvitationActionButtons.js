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
      setActiveInvites( prevActiveInvites => {
        const newArray = prevActiveInvites.filter( invite => invite.invitationId != result.invitationId )
        return newArray
      })   
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
    <div className='flex gap-4 items-center'>
      <button onClick={handleAccept} className='flex justify-center items-center h-[48px] bg-accent px-2 rounded-md font-bold text-white'>Accept</button>
      <button onClick={handleReject} className='flex justify-center items-center h-[48px] bg-red-500 px-2 rounded-md '>Decline</button>
    </div>
  )
}

export default InvitationActionButtons