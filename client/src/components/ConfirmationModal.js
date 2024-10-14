import React from 'react'

const ConfirmationModal = ({ confirmationModal, setConfirmationModal, deleteExistingActivity }) => {

  const closeModal = () => {
    setConfirmationModal(prev => { return {visible:false,activityId:null}})
  }

  if(confirmationModal?.visible){
    return(
      <div className={`absolute inset-0 flex justify-center items-center text-black font-Fredoka text-2xl z-50 backdrop-grayscale backdrop-blur-sm`} onClick={closeModal}>
        <div className='border-2 border-red-700 bg-primary w-10/12 rounded-xl flex flex-col gap-4 py-4' onClick={(e) => e.stopPropagation()}>
          <div className='flex flex-col justify-center items-center w-11/12'>
            <div className='font-bold'>Are you sure?</div>
            <div className='italic'>This cannot be undone.</div>
          </div>
          <div className='flex justify-center items-center gap-4'>
            <button onClick={(e) => deleteExistingActivity(e,confirmationModal.activityId, confirmationModal.dateString)} className={` bg-red-500 rounded-xl p-2 font-bold flex justify-center items-center`}>
              CONFIRM  
            </button>
            <div onClick={closeModal} className=' flex justify-center items-center p-2 border-2 border-black rounded-xl'>
              CANCEL  
            </div>
          </div>
        </div>
      </div>
    )
  }else{ return null}
    
}

export default ConfirmationModal