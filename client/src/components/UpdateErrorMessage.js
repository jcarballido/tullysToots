import React from 'react'

const UpdateErrorMessage = ({ visible, message }) => {
  return (
    <div  className={`absolute z-20 top-0 origin-top ${visible? 'visible scale-100':'invisible scale-0'}`} >
      UpdateErrorMessage
    </div>
  )
}

export default UpdateErrorMessage