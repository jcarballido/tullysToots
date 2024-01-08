import React from "react"
//Component import
import User from "./User"

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

export default Navigation