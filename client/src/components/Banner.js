import React from 'react'
import { Link } from 'react-router-dom'

const Logo = ({ setSlide, auth }) => {

  const handleOpen = (e) => {
    e.preventDefault()
    setSlide(true)
  }

  return(
    <div className='w-full max-w-screen flex justify-between items-center pt-2 px-2'>
      <Link to='/' className='flex justify-center items-center text-[26px]'>Tullys Toots</Link>
      { auth.isLoggedIn
        ? <button disabled={!setSlide} className={`flex justify-center items-center ${setSlide? 'visible':'invisible'}`} onClick={handleOpen} >Profile</button>
        : null
      }
    </div>
  )
} 

export default Logo