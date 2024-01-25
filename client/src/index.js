import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route
} from 'react-router-dom'
import Root from './layouts/Root.js'
import Login from './pages/Login.js'
import SignUp from './pages/SignUp.js'
import Profile from './pages/Profile.js'
import Activity from './pages/Activity.js'

const appElement = document.getElementById('app');
const root = createRoot(appElement)
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />} >
      <Route path="/" element={<Login />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="profile" element={<Profile />} />
      <Route path="activity" element={<Activity />} />
    </Route>
  )
)

root.render(<RouterProvider router={router}/>)