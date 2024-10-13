import React from 'react'
import add from '../media/add.svg'
import edit from '../media/edit.svg'

const ViewButtons = ({ handleAdding, handleEditing, savedRecords }) => {
  return (
    <>
      <button onClick={handleAdding} className={`flex flex-col gap-1 justify-center items-center rounded-xl bg-accent px-2 `}>
        <img className='h-[48px] flex items-center justify-center' src={add} />
        <div className='flex w-full justify-center items-center font-extrabold text-white'>Add</div>
      </button>
      {
        savedRecords?.length > 0
        ? <button onClick={handleEditing} className={`flex flex-col gap-1 justify-center items-center rounded-xl bg-primary px-2`}>
            <img className='rounded-xl w-[48px]' src={edit} />
            <div className='flex w-full justify-center items-center text-gray-900'>Edit</div>
          </button>
        : null 
      }
    </>
  )
}

export default ViewButtons