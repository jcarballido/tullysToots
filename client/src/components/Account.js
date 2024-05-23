import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Account() {

  // const navigate = useNavigate()
  const location = useLocation()
  // const previousLocation = location.state?.from

  // const previousPathSplit = previousLocation?.split('/')
  // const previousPageName = previousPathSplit[previousPathSplit.length - 1]
  // const previousPageNameCapitalized = previousPageName?.charAt(0).toUpperCase() + previousPageName?.slice(1)

  // const sendBack = (e) => {
  //   e.preventDefault()
  //   navigate(-1)
  // }

  return (
    <div className='h-full w-full border-4 border-black'>
      {/* <button className='w-full grow-0 flex items-center' onClick={sendBack}>{`<= ${previousPageNameCapitalized}`}</button> */}
      <div>Update Account</div>
      <div className='flex flex-col'>
        <Link to='/updateUsername' state={{ from: location.pathname }}>Update Username</Link>
        <Link to='/updatePassword' state={{ from: location.pathname }}>Update Password</Link>
      </div>
    </div>
  )
}

export default Account