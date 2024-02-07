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
import Activity from './pages/Activity.js'
import Dashboard from './pages/Dashboard.js'
import RequireAuth from './components/RequireAuth.js'
import Account from './components/Account.js'
import Invite from './components/Invite.js'
import Pets from './components/Pets.js'
import AcceptInvite from './components/AcceptInvite.js'
import { AuthProvider } from './context/AuthContext.js'

const appElement = document.getElementById('app');
const root = createRoot(appElement)
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
        <Route element={<HomeLayout />} >
          <Route path='/' element={<Login />} action={ loginAction } loader={ loginLoader }/>
          <Route path="signup" element={<SignUp />} action={ signUpAction } />
          <Route element={<RequireAuth />}>
            <Route path="activity" element={<Activity />} loader={null} />
          </Route> 
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />} >
            <Route path="dashboard" element={<Dashboard />} >
              <Route path="account" element={<Account />} />
              <Route path="invite" element={<Invite />} />
              <Route path="pets" element={<Pets />} >
                <Route path="acceptInvite" element={<AcceptInvite />} />
              </Route>
            </Route> 
          </Route>
        </Route> 
    </>
  )
)

root.render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)