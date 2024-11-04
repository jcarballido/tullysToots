import React from 'react'
import check from '../media/check.svg'
import cancel from '../media/cancel.svg'

const AddingButtons = ({ handleConfirmAdding, handleExit, newActivity }) => {
  return (
    <>
      <button onClick={handleConfirmAdding} className='flex gap-1 justify-center items-center rounded-xl bg-accent px-2 flex-col'>
        <img className='h-[48px] flex items-center justify-center' src={check} />
        <div className='flex w-full justify-center items-center font-extrabold text-white'>Save</div>
      </button>
      <button onClick={handleExit} className={`flex gap-1 justify-center items-center rounded-xl bg-primary px-2 flex-col `}>
        <img className='rounded-xl w-[48px]' src={cancel} />
        <div className='flex w-full justify-center items-center text-gray-900'>Cancel</div>
      </button>
    </>
  )
}

export default AddingButtons