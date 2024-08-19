import React, { useEffect,useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'
import Invitation from './Invitation' 

const AcceptInvite = () =>  {

  const [ activeInvites, setActiveInvites ] = useState([])

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyInvitation = async() => {
      try {
        const response = await axiosPrivate.get('/account/verifyInvite')        
        const inviteInfo = response.data // Represented as an array
        console.log('Invite info: ',inviteInfo)
        if(inviteInfo.queryError) throw new Error("Error fetching invites")
        // if(inviteInfo.length > 0) setActiveInvites([...inviteInfo])
        // else return
        return
      } catch (error) {
        console.log(`${error}`)
        return
      }
    }

    verifyInvitation()

  },[])

  return (
    <div>
      <div>AcceptInvite Component</div>
      {
        activeInvites?.length > 0
        ? <div className='w-full flex justify-center items-center'>
            You have pending invites! 
            {
              activeInvites.map( invite => {
                return (
                  <div key={invite.invitationId} className=' w-full flex justify-center items-center'>
                    <Invitation invitation={invite} />
                  </div>
                )
              })
            }
          </div>
        : <>
            <div>You currently have no pending invites. If you were expecting any, please ask for them to be re-sent.</div>
          </>
      }
      {
        //History
      }
    </div>
  )
}

export default AcceptInvite