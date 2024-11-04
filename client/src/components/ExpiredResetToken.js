import React from 'react'
import { Link } from 'react-router-dom'

const ExpiredResetToken = () => {
   return(
    <div className='grow p-4 text-xl'>
      Sorry, this link expired!
      Please request a new one on the <Link to='/' className='underline italic font-bold'>login page</Link>.
    </div>

   )
}

export default ExpiredResetToken