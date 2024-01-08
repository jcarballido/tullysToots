import React, { useState } from 'react'
// Component import
import Dashboard from '../components/Dashboard'
import Content from '../components/Content'
import Navigation from '../components/Navigation'

const Navigation = ({ active, setActive}) => {
  
  const links = ['Profile', 'Pets', 'Invitations']
  
  const handleNavClick = (e) => {
      e.preventDefault()
      const target = e.target
      const link = target.textContent.trim()
      setActive(link)
  }

  return(
      <nav classNames='min-w-max grow-0'>
          <User />
          {
              links.map( link => {
                  return(
                      <button onClick={handleNavClick}>
                          {link}
                      </button>
                  )
              })
          }
      </nav>
  )
}

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