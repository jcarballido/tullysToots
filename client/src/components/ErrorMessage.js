import React from 'react'

function ErrorMessage({ error, setError }) {

  const handleClose = (e) => {
    e.preventDefault()
    setError(false)
  }

  return (
    <div className={`w-full h-3/4 transition transform text-red-700 ${error?.status == 'true' ? 'visible scale-100':'invisible scale-0'}`}>
      {error?.message}
    </div> 
  )
}

export default ErrorMessage