import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext.js";
// Component imports
import LoginForm from "../components/LoginForm.js";
import CredentialsModal from "../components/CredentialsModal.js";
import useAuth from "../hooks/useAuth.js";
import {
  useNavigate,
  useOutletContext,
  Link,
  useActionData,
  useLoaderData,
  useLocation
} from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const loginData = useActionData();
  const location = useLocation()
  const loaderData = useLoaderData()

  console.log('Login Page Loader Data is: ', loaderData)
  // Update Context state to include accessToken
  useEffect(() => {
    loginData?.accessToken ? setAuth({ ...loginData }) : null;
  }, [loginData])

  useEffect(() => {
    console.log("Checking if user is logged in...", auth?.isLoggedIn);
    auth?.isLoggedIn ? navigate("activity") : null;
  }, [auth]);

  return (
    <CredentialsModal>
      <div className="flex justify-center items-center my-4">LOGIN</div>
      <LoginForm />
      <div className="flex justify-center items-center my-4">
        <div className="flex justify-center items-center mr-1">
          New to Tully's Toots?
        </div>
        <button className="min-w-[44px] min-h-[44px]">
          <Link to="/signup" className="flex justify-center items-center pl-1">
            Create an account
          </Link>
        </button>
      </div>
    </CredentialsModal>
  );
};

export const action = async ({ request }) => {
  // Parse request for username and password from fom submission
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  // Package credentials to send backend
  const credentials = { username, password };
  // Send to backend for verification; Expect to get back an access token or an access token and an invitation token
  try{
    const response = await axios
    .post("http://localhost:3000/account/sign-in", credentials)
    const accessToken = response.accessToken
    return { accessToken, isLoggedIn: true }
  }catch(e){
    console.log('Login action resulted in the following error: ',e)
    return null
  }
};

export const loader = () => {
  const validRefreshToken = axios
    .post('http://localhost:3000/checkRefreshToken')
    .then( res => {
      return res.data
    }).catch( e => {
      console.log('Loader request resulted in this error: ', e)
      return false
  })
  return validRefreshToken
}

export default Login;
