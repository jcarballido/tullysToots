import React from 'react'

const Toast = ({ visible, result, message }) => {
  return (
    <div className={`${visible? 'visible':'invisible'} absolute flex z-20 top-0 mt-10`}>
      <div>
        {result}
      </div>
      <div className='flex'>
        {message}
      </div>
    </div>
  )
}

export default Toast