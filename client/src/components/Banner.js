import React from 'react'
import { Link } from 'react-router-dom'
import heart from '../media/heart.svg'
import burger from '../media/burger.svg'

const Logo = ({ slide,setSlide, auth }) => {

  const handleOpen = (e) => {
    e.preventDefault()
    setSlide(true)
  }

  return(
    <div className='w-full  h-[48px] box-content flex justify-between items-center pt-2 border-b-2 bg-primary'>
      <Link to='/' className='flex gap-1 justify-center items-end font-Borel h-full ml-2'>
        <img src={heart} className='h-full' />
        <div className='flex items-end justify-center text-xl h-full'>Tully's Toots</div>
      </Link>
      { auth?.accessToken
        ? <img className={`flex justify-center items-center mr-2 h-[48px] ${slide? 'invisible':'visible'}`} onClick={handleOpen} src={burger} />
        : null
      }
    </div>
  )
} 

export default Logo