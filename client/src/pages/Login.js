import React, { useEffect, useState, useContext } from "react";
// Component imports
import LoginForm from "../components/LoginForm.js";
import CredentialsModal from "../components/CredentialsModal.js";
import useAuth from "../hooks/useAuth.js";
import {
  useNavigate,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams
} from "react-router-dom";
import { axiosPrivate } from '../api/axios.js'

const Login = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const actionData = useActionData();
  const [ searchParams ] = useSearchParams()
  const invitationToken = searchParams.get("invite")
  const [ error, setError ] = useState(null) 
  const [ activeInvite, setActiveInvite ] = useState(false)

  useEffect( () => {
    const checkLogin = async() => {
      try{
        const encodedInvitationToken = encodeURIComponent(invitationToken)
        const response = await axiosPrivate.get(`/account/checkLoginSession?invite=${encodedInvitationToken}`)
        const { accessToken,message, activeInvite } = response.data
        if(activeInvite) setActiveInvite(true)
        if(accessToken) {
          console.log('Access token returned.')
          setAuth({accessToken,isLoggedIn:true})
        }          

        if(message) console.log('Message from checking login session: ', message)
        else console.log('Response returned something unexpected: ', response.data)
      }catch(e){
        console.log('Error in checkLogin useEffect\'s fetch: ', e)
        return
      }
    }

    auth.accessToken? null:checkLogin()

  },[])

  useEffect( () => {
    auth?.accessToken 
    ? activeInvite
      ? navigate(`/acceptInvite`) 
      : navigate('/activity')
    : null

  },[auth])

  
  
  useEffect(() => {
    if(actionData?.accessToken){
      const { accessToken, isLoggedIn, activeInvite } = actionData
      if(activeInvite) setActiveInvite(true)
      setAuth({ accessToken, isLoggedIn })
    } else if(actionData?.error) {
      setError(actionData.error)
    }
  }, [actionData])

  return (
    <CredentialsModal>
      <div className="flex justify-center items-center my-4">LOGIN</div>
      <LoginForm error={ error } setError={ setError } invitationToken={ invitationToken } />
      <button className="min-w-[48px] min-h-[40px] flex flex-col justify-center items-center my-4">
        <div className="flex justify-center items-center">
          New to Tully's Toots?
        </div>
        <Link to={invitationToken? `/signup?invite=${invitationToken}`:'signup'} className="flex justify-center items-center pl-1">
          Create an account
        </Link>
      </button>
      <div className="flex justify-center items-center my-4">
        <button className="min-w-[44px] min-h-[44px]">
          <Link to='/forgotPassword' className="flex justify-center items-center pl-1">
            Forgot Password
          </Link>
        </button>
      </div>
    </CredentialsModal>
  );
};

//Need to handle response for wrong credentials
export const action = async ({ request }) => {
  
  const formData = await request.formData(); // Parse request for username and password from form submission
  const username = formData.get("username");
  const password = formData.get("password");
 
  const credentials = { username, password };  // Package credentials to send to backend
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);

  const invitationToken = queryParams.get("invite")  // Capture the invitation token

// Send to backend for verification; Expect to get back an access token
  try{
    const encodedInvitationToken = encodeURIComponent(invitationToken)
    const response = await axiosPrivate
      .post(`/account/sign-in?invite=${encodedInvitationToken}`, credentials)
    const { accessToken, activeInvite } = response.data
    return { accessToken, activeInvite }
  }catch(e){
    console.log('Sign In action resulted in the following error: ',e)
    const error = e.response.data.error
    return { error }
  }
}

export default Login;
