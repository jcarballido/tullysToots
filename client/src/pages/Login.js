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
import axios from '../api/axios.js'
import ErrorMessage from "../components/ErrorMessage.js";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const actionData = useActionData();
  const loaderData = useLoaderData()
  const [searchParams, ...rest] = useSearchParams()
  const invitationToken = searchParams.get("invite")
  const [ error, setError ] = useState(null)

  /*
  Need to handle the following flow...
  1. Page will render the first time with loader data available 'immediately'
    loaderData will indicate if the user attempting to access the root page is a regsitered user and if their login session is ongoing.
  2. useEffect will run after the initial render to assess loader data.
    If no refresh token was sent to te server, user will need to either log in or sign up.
    If refresh token was received, but no longer valid (expired), user will be left on the login page (with an invitation token in the URL).
    If refresh token was received and is valid, user is redircted to the '/dashboard/acceptInvite' page.
  */

    useEffect(() => {
      if( loaderData.isLoggedIn ){
        const { accessToken, isLoggedIn } = loaderData
        setAuth({ accessToken,isLoggedIn })
      }
    }, [loaderData])
  
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
          ? navigate(`/dashboard/acceptInvite?invite=${invitationToken}`)
          : navigate('/activity')
        ) 
      : null;
  }, [auth])

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
  // Parse request for username and password from fom submission
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  // Package credentials to send backend
  const credentials = { username, password };
  // Send to backend for verification; Expect to get back an access token
  try{
    const response = await axios
    .post('/account/sign-in', credentials)
    const accessToken = response.data.detail
    return { accessToken, isLoggedIn: true }
  }catch(e){
    const error = e.response
    return { isLoggedIn: false, error }
  }
}

export const loader = () => {
  const activeLogin = axios
    .get('/account/checkLoginSession')
    .then( res => {
      const { accessToken } = res.data
      return { accessToken, isLoggedIn:true }
    }).catch( e => {
      const error = e.response
    return { isLoggedIn: false, error }
  })
  return activeLogin
}

export default Login;
