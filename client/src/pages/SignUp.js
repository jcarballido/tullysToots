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
import axios from 'axios'

const SignUp = () => {

  const { auth,setAuth } = useAuth()
  const navigate = useNavigate()
  const loaderData = useLoaderData()
  const actionData = useActionData()
  const [ searchParams ] = useSearchParams()
  const invitationToken = searchParams.get('invite')
  const [ error, setError ] = useState(null)
  console.log('(SignUp.js)Invitation token from URL: ', invitationToken)

  useEffect( () => {

    const checkLogin = async() => {
      try{
        const response = await axiosPrivate.get('/account/checkLoginSession')
        if(response.data.accessToken) {
          // if(invitationToken) {
          //   setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
          //   return navigate(`/acceptInvite?invite=${invitationToken}`)
          // }
          return setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
        }
        if(response.data.error) return 
        return 
      
      }catch(e){
        console.log('Error in loader: ', e)
        return
      }
    }

    checkLogin()
  },[])

  useEffect(() => {
    if( actionData?.isLoggedIn ){
      const { accessToken, isLoggedIn } = actionData
      setAuth({ accessToken, isLoggedIn })
    } else if(actionData?.error) {
      setError(actionData.error)
    }
  }, [actionData])

  useEffect(() => {
    auth?.isLoggedIn 
      ? (invitationToken 
          ? navigate(`/acceptInvite?invite=${invitationToken}`)
          : navigate('/activity')
        ) 
      : null;
  }, [auth])

  return(
    <CredentialsModal>
      <div className='flex justify-center items-center my-4'>
          WELCOME!
      </div>
      <SignUpForm error={ error } setError={ setError } />
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
  try{
    const response = await axios.post("http://localhost:3000/account/sign-up",newOwnerData)
    const accessToken = response.data.accessToken
    return { accessToken, isLoggedIn: true }
  } catch(e){
    console.log('Sign Up action resulted in the following error: ',e)
    const error = e.response.data
    return { isLoggedIn: false, error }
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