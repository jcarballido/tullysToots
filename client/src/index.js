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
import Login, { action as loginAction } from './pages/Login.js'
import SignUp, { action as signUpAction } from './pages/SignUp.js'
import Profile from './pages/Profile.js'
import Activity,{ loader as activityLoader, action as activityAction } from './pages/Activity.js'
import Dashboard from './pages/Dashboard.js'
import DashboardNavigation from './components/DashboardNavigation.js';
import RequireAuth from './components/RequireAuth.js'
import Account from './components/Account.js'
import Invite from './components/Invite.js'
import Pets, { action as petsAction } from './components/Pets.js'
import AcceptInvite from './components/AcceptInvite.js'
import UpdatePassword, { action as updatePasswordAction } from './components/UpdatePassword.js'
import ForgotPassword, {action as forgotPasswordAction} from './pages/ForgotPassword.js'
import NotFound from './pages/NotFound.js'
import { AuthProvider } from './context/AuthContext.js'
import UpdateUsername, { action as updateUsernameAction } from './components/UpdateUsername.js';
import ResetPassword, { action as resetPasswordAction} from './pages/ResetPassword'

const appElement = document.getElementById('app');
const root = createRoot(appElement)
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<HomeLayout />} >
        <Route path="/" element={<Login />} action={ loginAction }  />
        <Route path="signup" element={<SignUp />} action={ signUpAction } />
        <Route path="forgotPassword" element={<ForgotPassword/>} action={forgotPasswordAction} />
        <Route path="resetPassword" element={<ResetPassword/>} action={resetPasswordAction} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<HomeLayout />}>
          <Route path="activity" element={<Activity />} loader={activityLoader} action={activityAction} />
        </Route> 
        <Route element={<DashboardLayout />} >
          <Route path="dashboard" element={<DashboardNavigation />} />
          <Route path="account" element={<Account />} />
          <Route path="sendInvite" element={<Invite />} />
          <Route path="pets" element={<Pets />} action={petsAction}/>
          <Route path="acceptInvite" element={<AcceptInvite />} />
          <Route path="updatePassword" element={<UpdatePassword />} action={updatePasswordAction} />
          <Route path="updateUsername" element={<UpdateUsername />} action={updateUsernameAction}/>
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