import React, { useState } from 'react'
// Component import
import Dashboard from '../components/Dashboard'
import Content from '../components/Content'
import Navigation from '../components/Navigation'

const Profile = () => {

  const [ active,setActive ] = useState('profile')

  return(
    <Dashboard>
        <Navigation active={active} setActive={setActive}/>
        <Content active={active}/>
    </Dashboard>
  )
}

export default Profile