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
} from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const loginData = useActionData();

  // Check for any errors
  useEffect(() => {
    if (loginData?.Error)
      console.log("Error with login submission: ", loginData.Error);
  });

  // Update Context state to include accessToken
  useEffect(() => {
    loginData?.accessToken ? setAuth({ ...loginData }) : null;
  }, [loginData]);
  // Check to see if user is currently logged in
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
  const data = axios
    .post("http://localhost:3000/account/sign-in", credentials)
    .then((res) => {
      return {...res.data, isLoggedIn: true}
    })
    .catch((e) => {
      console.log("Error signing in: ", e);
      return null;
    });
  // Return the auth object if credentials are valid or return null
  return data;
};

export default Login;
