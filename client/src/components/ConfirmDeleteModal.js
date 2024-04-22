import React from 'react'

const ConfirmDeleteModal = ({ confirmationModalVisibility, setConfirmationModalVisibility, deleteExistingActivity }) => {

  const closeModal = () => {
    setConfirmationModalVisibility(prev => { return {visible:false,activityId:null}})
  }

  return(
    <div className={`w-full h-full z-20 border-4 border-red-500 flex flex-col items-center justify-start absolute transform origin-center ${confirmationModalVisibility.visible ? 'backdrop-grayscale scale-100':'backdrop-grayscale-0 scale-0'}`}>
      CONFIRM DELETION
      You are permanenly deleting this record. This cannot be undone.
      <div className='flex justify-center items-center gap-4'>
        <button onClick={(e) => deleteExistingActivity(e,confirmationModalVisibility.activityId)} className={` bg-yellow-500 disabled:bg-red-700`}>
          CONFIRM  
        </button>
        <div onClick={closeModal}>
          CANCEL  
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal