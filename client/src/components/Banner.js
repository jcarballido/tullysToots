import React from 'react'
import { Link } from 'react-router-dom'
import heart from '../media/heart.svg'

const Logo = ({ slide,setSlide, auth }) => {

  const handleOpen = (e) => {
    e.preventDefault()
    setSlide(true)
  }

  return(
    <div className='w-full max-w-screen h-[48px] flex justify-between items-center pt-2 px-2 border-b-2 bg-primary'>
      <Link to='/' className='flex gap-1 justify-center items-end font-Borel h-full'>
        <img src={heart} className='h-full' />
        <div className='flex items-end justify-center text-xl h-full'>Tully's Toots</div>
      </Link>
      { auth?.accessToken
        ? <button disabled={slide} className={`flex justify-center items-center ${slide? 'invisible':'visible'}`} onClick={handleOpen} >Profile</button>
        : null
      }
    </div>
  )
} 

export default Logo