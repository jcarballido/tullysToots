import React, { useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'

const AcceptInvite = () =>  {

  const [ activeInvites, setActiveInvites ] = useState([])

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyInvitation = async() => {
      try {
        const response = await axiosPrivate.get('/account/verifyInvitation')        
        const inviteInfo = response.data // Represented as an array
        if(inviteInfo.error) throw new Error("Error fetching invites")
        if(inviteInfo.length > 0) setActiveInvites([...inviteInfo])
        else return
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
                    <div>
                      { invite.sendingOwnerUsername }
                    </div> 
                    {
                      invite.petInfo.map( info => {
                        const { name,sex,dob } = info
                        return(
                          <>
                            <div>
                              {name}
                            </div> 
                              <div>
                              {sex}
                            </div> 
                              <div>
                              {dob}
                            </div> 
                          </>
                        )
                        
                      })
                    }
                    <button id={invite.invitationId} className='border-2 border-black rounded-lg bg-green-500' onClick={handleAccept}>ACCEPT</button>
                    <button id={invite.invitationId} className='border-2 border-black rounded-lg bg-red-500' onClick={handleReject}>REJECT</button>
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