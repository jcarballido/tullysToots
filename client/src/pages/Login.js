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
// import ErrorMessage from "../components/ErrorMessage.js";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const actionData = useActionData();
  // const loaderData = useLoaderData()
  const [ searchParams ] = useSearchParams()
  const invitationToken = searchParams.get("invite")
  console.log('Invitation token and auth: ', invitationToken,'/',auth.accessToken)
  const [ error, setError ] = useState(null)


  useEffect( () => {

    const checkLogin = async() => {
      try{
        const response = await axiosPrivate.get('/account/checkLoginSession')
        if(response.data.accessToken) {
          if(invitationToken) {
            setAuth({accessToken:response.data.accessToken,isLoggedIn:true})
            return navigate(`/acceptInvite?invite=${invitationToken}`)
          }
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

  useEffect( () => {
    if(auth?.isLoggedIn && invitationToken) return navigate(`/acceptInvite?invite=${invitationToken}`)
    if(auth?.isLoggedIn) return navigate('/activity')
    console.log('useEffect ran and did not execute anything')
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
    if( actionData?.isLoggedIn ){
      const { accessToken, isLoggedIn } = actionData
      setAuth(prev => {return {...prev, accessToken, isLoggedIn }})
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
      <LoginForm error={ error } setError={ setError } />
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
  // Send to backend for verification; Expect to get back an access token
  try{
    const response = await axiosPrivate
    .post('/account/sign-in', credentials)
    const accessToken = response.data.accessToken
    return { accessToken, isLoggedIn: true }
  }catch(e){
    const error = e.response
    return { error:error.data.error }
  }
}

export const loader = async () => {

  try{
    const response = await axiosPrivate.get('/account/checkLoginSession')
    if(response.data.accessToken) return response.data
    if(response.data.error) return response.data.error
    return response.data
  
  }catch(e){
    console.log('Error in loader: ', e)
    throw new Error('Some error in loader')
  }
  // try{
  //   const response = await axiosPrivate.get('/account/checkLoginSession')
  //   console.log('Loader response: ', response)
  //   return response
  // }catch(e){
  //   console.log('Error caught in Login loader: ', e)
  //   throw e
  // }

  // return 'some data'
    
    // const accessToken = response?.data?.accessToken
    // const error = response?.data?.error
    // if(response.data.accessToken) return { accessToken,isLoggedIn:true }
    // // const accessToken = resp, isLoggedIn:true }
    // // else if(error) return {error:'New session started'}
    // else return null
    // console.log('Response: ', response)
    // return { accessToken, isLoggedIn:true }
    // return response

}

export default Login;
