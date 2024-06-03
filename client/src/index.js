import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route
} from 'react-router-dom'
import { Home as HomeLayout } from './layouts/Home.js'
import { Dashboard as DashboardLayout } from './layouts/Dashboard.js';
import Login, { action as loginAction, loader as loginLoader } from './pages/Login.js'
import SignUp, { action as signUpAction } from './pages/SignUp.js'
import Profile from './pages/Profile.js'
import Activity,{ loader as activityLoader } from './pages/Activity.js'
import Dashboard from './pages/Dashboard.js'
import DashboardNavigation from './components/DashboardNavigation.js';
import RequireAuth from './components/RequireAuth.js'
import Account from './components/Account.js'
import Invite from './components/Invite.js'
import Pets, { loader as petsLoader } from './components/Pets.js'
import AcceptInvite from './components/AcceptInvite.js'
import UpdatePassword, { action as updatePasswordAction } from './components/UpdatePassword.js'
import ForgotPassword from './pages/ForgotPassword.js'
import NotFound from './pages/NotFound.js'
import { AuthProvider } from './context/AuthContext.js'
import UpdateUsername, { action as updateUsernameAction } from './components/UpdateUsername.js';

const appElement = document.getElementById('app');
const root = createRoot(appElement)
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<HomeLayout />} >
        <Route path="/" element={<Login />} action={ loginAction } loader={ loginLoader }/>
        <Route path="signup" element={<SignUp />} action={ signUpAction } />
        <Route path="forgotPassword" element={<ForgotPassword/>} />
        <Route element={<RequireAuth />}>
          <Route path="activity" element={<Activity />} loader={activityLoader} />
        </Route> 
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />} >
          {/* <Route path="dashboard" element={<Dashboard />} > */}
          <Route path="dashboard" element={<DashboardNavigation />} />
          <Route path="account" element={<Account />} />
          <Route path="invite" element={<Invite />} />
          <Route path="pets" element={<Pets />} loader={petsLoader}/>
          <Route path="acceptInvite" element={<AcceptInvite />} />
          <Route path="updatePassword" element={<UpdatePassword />} action={updatePasswordAction} />
          <Route path="updateUsername" element={<UpdateUsername />} action={updateUsernameAction}/>
          {/* </Route>  */}
        </Route>
      </Route> 
      <Route path='*' element={<NotFound />} />
    </>
  )
)

root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)