import React, { useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useNavigate } from 'react-router-dom'

const AcceptInvite = () =>  {
  // Check if an invite exists and if it's still active in DB
    // If not, ensure the invite is invalidated and remove the link between the onwer and invite token
  // If so, parse the info on the server and pass necessary data to client to render.
  // Client will then present the owner with the option of accepting, rejecting the invite, or coming back to it at a later time.
  // If returning at a later time, cycle will repeat itself (checking invite expiration, etc.) 
  const [ invitedPets, setInvitedPets ] = useState([])

  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  useEffect(() => {
    const verifyInvitation = async() => {
      const response = await axiosPrivate.get('/account/verifyInvitation')
      if(response.data.nullInvite) navigate('/')
      if(response.data.sharedPets){
        setInvitedPets([...response.data.sharedPets])
      }
    }

    verifyInvitation()

  },[])

  return (
    <div>
      <div>AcceptInvite Component</div>
      {
        invitedPets?.map( pet => {
          <div className='w-full flex justify-center items-center'>{pet.name}</div>
        })
      }
      {
        invitedPets?.length > 0
        ? <>
            <div className='w-full flex justify-center items-center'>
              Someone is sharing their pet's activity with you! 
            </div>
            <div className=' w-full flex justify-center items-center'>
            <button className='border-2 border-black rounded-lg bg-green-500' onClick={handleAccept}>ACCEPT</button>
            <button className='border-2 border-black rounded-lg bg-red-500' onClick={handleReject}>REJECT</button>
            </div>
          </>
        : null
      }
    </div>
  )
}

export default AcceptInvite