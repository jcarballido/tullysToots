import React from 'react'

function ErrorMessage({ error, setError }) {

  const handleClose = (e) => {
    e.preventDefault()
    setError(false)
  }

  return (
    <div className={`w-3/4 h-3/4 z-50 bg-amber-100 flex flex-col items-center text-black absolute ml-[] ${error? 'visible':'invisible'}`}>
      {error ? error.detail:null}
      <button onClick={ handleClose } className='bg-red-500 text-black w-[44px] h-[44px]'>Close Window</button>
    </div>
  )
}

export default ErrorMessage