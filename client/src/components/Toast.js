import React, { useEffect } from 'react'

const Toast = ({ visible, result, message, setToast }) => {

  useEffect( () => {
    if(visible){
      const toastTimer = setTimeout( () => {
        setToast( previousToast => {
          return {...previousToast, visible:false}
        })
      }, 5000)
      return () => clearTimeout(toastTimer)
    }
  },[visible])

  return (
    <div className={`absolute w-3/4 min-h- bg-yellow-500 rounded-xl flex-col z-40 top-0 right-0 mt-10 transition duration-500 ease-in ${visible? 'translate-y-0':'-translate-y-[150px]'} `}>
      <div className='flex'>
        <div className='flex justify-center items-center basis-1/5 grow-0 border-black border-2' >
          {result}
        </div>
        <div className='min-w-max justify-center items-center grow border-black border-2'>
          {message}
        </div>
        <button className='flex justify-end grow items-center border-black border-2 h-' onClick={ () => setToast(previousToast => {return {...previousToast, visible:false }})}>
          X
        </button>
      </div>
      <div className={`h-[4px] w-full transition bg-black origin-right ease-linear ${visible? 'duration-[4500ms] delay-500 scale-x-0 ':'scale-x-100 delay-[600ms] duration-0'}`}  />
    </div>
  )
}

export default Toast