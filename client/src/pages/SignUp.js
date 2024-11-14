import React,{ useEffect, useState } from 'react'
import { 
  Link, 
  useActionData, 
  useNavigate, 
  useSearchParams, 
  useLoaderData 
} from 'react-router-dom'
// Components import
import CredentialsModal from '../components/CredentialsModal'
import SignUpForm from '../components/SignUpForm'
import useAuth from '../hooks/useAuth'
// import axios from 'axios'
import { axiosPrivate } from '../api/axios'

const SignUp = () => {

  const { auth,setAuth,username } = useAuth()
  const navigate = useNavigate()
  // const loaderData = useLoaderData()
  const actionData = useActionData()
  const [ searchParams ] = useSearchParams()
  const invitationToken = searchParams.get('invite')
  const parsedInvitationToken = invitationToken == 'null'? JSON.parse(invitationToken):invitationToken

  const [ activeInvite, setActiveInvite ] = useState(false)
  const [ error, setError ] = useState({ status:'false' })

  useEffect( () => {
    const checkLogin = async() => {
      try{
        const encodedInvitationToken = encodeURIComponent(invitationToken)
        const response = await axiosPrivate.get(`/account/checkLoginSession?invite=${encodedInvitationToken}`)
        const { accessToken, message, activeInvite, username } = response.data
        if(activeInvite) setActiveInvite(true)
        if(accessToken) {
          console.log('Access token returned.')
          setAuth({accessToken,isLoggedIn:true, username})
         
        }          
        if(message) console.log('Message from checking login session: ', message)
        else console.log('Response returned something unexpected: ', response.data)
      }catch(e){
        console.log('Error in checkLogin useEffect\'s fetch: ', e)
        
      }
    }

    auth.accessToken? null:checkLogin()

    // if(!auth?.isLoggedIn) checkLogin()
    // if(auth?.isLoggedIn && invitationToken) return navigate(`/acceptInvite?invite=${invitationToken}`)
    // if(auth?.isLoggedIn) return navigate('/activity')
    // console.log('useEffect ran and did not execute anything')
  },[])

  useEffect( () => {
    auth?.accessToken 
    ? activeInvite
      ? navigate(`/acceptInvite`) 
      : navigate('/activity')
    : null

  },[auth])


  // useEffect( () => {

  //   const checkLogin = async() => {
  //     try{
  //       const response = await axiosPrivate.get('/account/checkLoginSession')
  //       if(response.data.accessToken) {
  //         // if(invitationToken) {
  //         //   setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
  //         //   return navigate(`/acceptInvite?invite=${invitationToken}`)
  //         // }
  //         return setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
  //       }
  //       if(response.data.error) return 
  //       return 
      
  //     }catch(e){
  //       console.log('Error in loader: ', e)
  //       return
  //     }
  //   }

  //   checkLogin()
  // },[])
  // useEffect( () => {
  //   const checkLogin = async() => {
  //     // console.log('Check login useEffect ran')
  //     try{
  //       const encodedInvitationToken = encodeURIComponent(JSON.stringify(invitationToken))
  //       const response = await axiosPrivate.get(`/account/checkLoginSession?invite=${encodedInvitationToken}`)
  //       // console.log('Response in Login component: ', response.data)
  //       if(response.data.accessToken) {
  //         setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
  //       }          
  //       if(response.data.error) {
  //         console.log('Error checking for login session: ', response.data.error)
  //         const cleanUrl = window.location.pathname;
  //         navigate(cleanUrl, { replace: true });
  //       }
  //       if(response.data.message) console.log('Message from checking login session: ', response.data.message)
  //       return 
  //     }catch(e){
  //       console.log('Error in checkLogin useEffect: ', e)
  //       return
  //     }
  //   }

  //   auth?.isLoggedIn 
  //     ? (auth?.expiredInvite)
  //       ? navigate('/activity')
  //       : (parsedInvitationToken
  //         ? navigate(`/acceptInvite?invite=${invitationToken}`)
  //         : navigate('/activity'))
  //     : null

  //   // if(!auth?.isLoggedIn) checkLogin()
  //   // if(auth?.isLoggedIn && invitationToken) return navigate(`/acceptInvite?invite=${invitationToken}`)
  //   // if(auth?.isLoggedIn) return navigate('/activity')
  //   // console.log('useEffect ran and did not execute anything')
  // },[auth])

  useEffect(() => {
    if(actionData?.accessToken){
      const { accessToken, isLoggedIn, activeInvite,username } = actionData
      if(activeInvite) setActiveInvite(true)
        setAuth({ accessToken, isLoggedIn,username })
    } else if(actionData?.error) {
      console.log('Action data error:', actionData.error)
      setError({status:'true',message:`${actionData.error.message}`})
    }
  }, [actionData])

  // useEffect(() => {
  //   auth?.isLoggedIn 
  //     ? (invitationToken 
  //         ? navigate(`/acceptInvite?invite=${invitationToken}`)
  //         : navigate('/activity')
  //       ) 
  //     : null;
  // }, [auth])

  return(
    <CredentialsModal>
      <div className='flex justify-center items-center my-4 font-bold text-xl'>
          Welcome!
      </div>
      <SignUpForm error={ error } setError={ setError } invitationToken={invitationToken}/>
      <div className='flex justify-center items-center pr-1'>Already have an account?</div>
        <button>
            <Link to='/'>Sign in</Link>
        </button >
    </CredentialsModal>
  )
}

// Need to handle response for existing credentials 
export const action = async ({ request }) => {
  const formData = await request.formData()
  const username = formData.get("username")
  const password = formData.get("password")
  const email = formData.get("email")
  const newOwnerData = { email, username, password }
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  // console.log('Action request URL: ', url)
  const invitationToken = queryParams.get("invite")
  try{
    const encodedInvitationToken = encodeURIComponent(invitationToken)
    const response = await axiosPrivate
    .post(`/account/sign-up?invite=${encodedInvitationToken}`, newOwnerData)
    console.log('Response from Sign up: ', response)
    const { accessToken, activeInvite, username } = response.data
    // const accessToken = response.data.accessToken
    return { accessToken, activeInvite, username }
  } catch(e){
    // console.log('Sign Up action resulted in the following error: ',e)
    const error = e.response.data
    return { error }
  }
}

// export const loader = () => {
//   const activeLogin = axios
//     .post('http://localhost:3000/checkLoginSession')
//     .then( res => {
//       const { accessToken } = res.data
//       return { accessToken, isLoggedIn:true }
//     }).catch( e => {
//       console.log('Loader request resulted in this error: ', e)
//       const error = e.response.data
//       return { isLoggedIn:false, error }
//   })
//   return activeLogin
// }

export default SignUp