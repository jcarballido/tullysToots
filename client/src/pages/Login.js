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
// import axios from 'axios'
// import ErrorMessage from "../components/ErrorMessage.js";

const Login = () => {
  const { auth, setAuth } = useAuth();
  // const [ mounted, setMounted ] = useState(false)
  const navigate = useNavigate();
  const actionData = useActionData();
  // const loaderData = useLoaderData()
  const [ searchParams ] = useSearchParams()
  const invitationToken = searchParams.get("invite")
  const parsedInvitationToken = invitationToken == 'null'? JSON.parse(invitationToken):invitationToken
  // console.log('Invitation token and auth: ', invitationToken,'/',auth.accessToken)
  const [ error, setError ] = useState(null) 


  // useEffect( () => {
  //   console.log('Login useEffect first render useEffect. Auth is: ', auth)
  // })

  useEffect( () => {
    const checkLogin = async() => {
      // console.log('Check login useEffect ran')
      try{
        const encodedInvitationToken = encodeURIComponent(JSON.stringify(invitationToken))
        const response = await axiosPrivate.get(`/account/checkLoginSession?invite=${encodedInvitationToken}`)
        // console.log('Response in Login component: ', response.data)
        if(response.data.accessToken) {
          setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
        }          
        if(response.data.error) {
          console.log('Error checking for login session: ', response.data.error)
          const cleanUrl = window.location.pathname;
          navigate(cleanUrl, { replace: true });
        }
        if(response.data.message) console.log('Message from checking login session: ', response.data.message)
        return 
      }catch(e){
        console.log('Error in checkLogin useEffect: ', e)
        return
      }
    }

    auth?.isLoggedIn 
      ? (auth?.expiredInvite)
        ? navigate('/activity')
        : (parsedInvitationToken
          ? navigate(`/acceptInvite?invite=${invitationToken}`)
          : navigate('/activity'))
      : checkLogin()

    // if(!auth?.isLoggedIn) checkLogin()
    // if(auth?.isLoggedIn && invitationToken) return navigate(`/acceptInvite?invite=${invitationToken}`)
    // if(auth?.isLoggedIn) return navigate('/activity')
    // console.log('useEffect ran and did not execute anything')
  },[auth])

  // useEffect(() => {
  //   const { accessToken, error } = loaderData
  //   // if(error) {
  //   //   console.log('Error in useEffect for loader data: ', error)
  //   //   return
  //   // }
  //   if(accessToken) setAuth({accessToken,isLoggedIn:true})
  //   console.log('Loader Data: ', loaderData)
  // }, [loaderData])
  
  useEffect(() => {
    // console.log('Action Data from useEffect: ', actionData)
    if( actionData?.accessToken && actionData?.expiredInvite ){
      console.log('Invite expired')
      const { accessToken, isLoggedIn, expiredInvite } = actionData
      setAuth({ accessToken, isLoggedIn, expiredInvite })
    } else if(actionData?.accessToken){
      const { accessToken, isLoggedIn } = actionData
      setAuth({ accessToken, isLoggedIn })
    } else if(actionData?.error) {
      setError(actionData.error)
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

  // useEffect(() => {
  //   console.log('Testing to see if loaderData causes a re-render; loaderData useEffect ran.')
  //   setAuth('loaderData was evaluated')
  //   loaderData?.isLoggedIn
  //     ? setAuth( prev => {return {...prev, accessToken: loaderData.accessToken, isLoggedIn: loaderData.isLoggedIn}})
  //     : setAuth(loaderData)
  // },[loaderData])
  // // Update Context state to include accessToken
  // useEffect(() => {
  //   if (hasMounted) {
  //     console.log('Effect ran after the first render!');
  //     console.log('LoginData received; loginData useEffect ran')search.replace('?','').split()
  //   } else {
  //     // Update the state to indicate that the component has mounted
  //     setHasMounted(true);
  //   }
    
  //   loginData?.accessToken ? setAuth({ ...loginData }) : null;
  // }, [hasMounted])

  // useEffect(() => {
  //   console.log('Auth useEffect ran')
  //   // console.log("Checking if user is logged in...", auth?.isLoggedIn);
  //   // auth?.isLoggedIn ? navigate("activity") : null;
  // }, [auth]);

  return (
    <CredentialsModal>
      <div className="flex justify-center items-center my-4">LOGIN</div>
      <LoginForm error={ error } setError={ setError } invitationToken={ invitationToken } />
      <div className="flex justify-center items-center my-4">
        <div className="flex justify-center items-center mr-1">
          New to Tully's Toots?
        </div>
        <button className="min-w-[44px] min-h-[44px]">
          <Link to={invitationToken? `/signup?invite=${invitationToken}`:'signup'} className="flex justify-center items-center pl-1">
            Create an account
          </Link>
        </button>
      </div>
    </CredentialsModal>
  );
};

//Need to handle response for wrong credentials
export const action = async ({ request }) => {
  // Parse request for username and password from form submission
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  // Package credentials to send to backend
  const credentials = { username, password };
  // Capture the invitation token
  const url = new URL(request.url);
  const queryParams = new URLSearchParams(url.search);
  // console.log('Action request URL: ', url)
  const invitationToken = queryParams.get("invite")
  // console.log('Query params: ', test)
  // Send to backend for verification; Expect to get back an access token
  try{
      const encodedInvitationToken = encodeURIComponent(JSON.stringify(invitationToken))
      const response = await axiosPrivate
      .post(`/account/sign-in?invite=${encodedInvitationToken}`, credentials)
      // console.log('Response received from sign-in request: ', response)
      const accessToken = response.data.accessToken
      const expiredToken = response.data.error
      if(expiredToken){
        return { accessToken, isLoggedIn:true, expiredInvite: true }
      }
      return { accessToken, isLoggedIn: true }
  }catch(e){
    console.log('Sign In action resulted in the following error: ',e)
    const error = e.response
    return { error:error.data.error }
  }


}

// export const loader = async () => {

//   try{
//     const response = await axiosPrivate.get('/account/checkLoginSession')
//     if(response.data.accessToken) return response.data
//     if(response.data.error) return response.data.error
//     return response.data
  
//   }catch(e){
//     console.log('Error in loader: ', e)
//     throw new Error('Some error in loader')
//   }
//   // try{
//   //   const response = await axiosPrivate.get('/account/checkLoginSession')
//   //   console.log('Loader response: ', response)
//   //   return response
//   // }catch(e){
//   //   console.log('Error caught in Login loader: ', e)
//   //   throw e
//   // }

//   // return 'some data'
    
//     // const accessToken = response?.data?.accessToken
//     // const error = response?.data?.error
//     // if(response.data.accessToken) return { accessToken,isLoggedIn:true }
//     // // const accessToken = resp, isLoggedIn:true }
//     // // else if(error) return {error:'New session started'}
//     // else return null
//     // console.log('Response: ', response)
//     // return { accessToken, isLoggedIn:true }
//     // return response

// }

export default Login;
