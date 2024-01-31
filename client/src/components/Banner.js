import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => {
  return(
    <div className='w-full max-w-screen flex justify-between items-center pt-2 px-2'>
      <Link to='/' className='flex justify-center items-center text-[26px]'>Tullys Toots</Link>
      <div className='flex justify-center items-center'>Profile</div>
    </div>
  )
} 

export default Logo