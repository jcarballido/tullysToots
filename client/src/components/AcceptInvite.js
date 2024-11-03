import React, { useEffect,useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Invitation from './Invitation' 

const AcceptInvite = () =>  {

  const [ activeInvites, setActiveInvites ] = useState([])

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    const verifyInvitation = async() => {
      try {
        const response = await axiosPrivate.get('/account/verifyInvite')        
        const inviteInfo = response.data // Represented as an array
        console.log('Invite info: ',inviteInfo)
        if(inviteInfo.queryError) throw new Error("Error fetching invites")
        if(inviteInfo.length > 0) setActiveInvites([...inviteInfo])
      } catch (error) {
        console.log(`Error verifying invitations ${error}`)
      }
    }
    verifyInvitation()

  },[])

  return (
    <div className='grow flex justify-start items-center flex-col w-full overflow-hidden'>
      {
        activeInvites?.length > 0
        ? <div>You have pending invites!</div>
        : <div>You currently have no pending invites. If you were expecting any, please ask for them to be re-sent.</div> 
      }
      {
        activeInvites?.length > 0
        ? <div className='w-full flex justify-start items-center flex-col gap-2 overflow-y-auto'>
            {
              activeInvites.map( (invite,index) => {
                return (
                  <div key={invite.invitationId} className=' w-full flex justify-center items-center'>
                    <Invitation invitation={invite} index={index} setActiveInvites={ setActiveInvites } />
                  </div>
                )
              })
            }
          </div>
        : 
          null
      }
      {
        //History
      }
    </div>
  )
}

export default AcceptInvite