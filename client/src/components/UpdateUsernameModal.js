import React from 'react'

const UpdateUsernameModal = ({ updateUsernameModal, setUpdateUsernameModal }) => {

  const closeModal = () => {
    setUpdateUsernameModal({ visible:false })
  }
  if(updateUsernameModal?.visible){
    return (
      <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-40 backdrop-grayscale backdrop-blur-sm`} onClick={closeModal}>
        <Form className={ `transition flex flex-col gap-5 justify-start items-start text-black z-10 mt-16 bg-primary border-8 border-secondary-dark p-4 rounded-2xl w-11/12 ` } onClick={(e) => e.stopPropagation()} >
            <legend className='flex justify-center items-center w-full font-bold mb-4 tracking-wide' >Tell us about your pet...</legend>
            <label htmlFor='name' className='border-b-2 border-gray-400 pb-5 flex justify-between items-center flex-nowrap w-full' >
              <div className='w-1/4 '> Name: </div>
              <input type='text' name='name' id='name' onChange={''}  className='rounded-md w-3/4 focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none  px-2'/>          
            </label>
            <label htmlFor='dob' className='border-b-2 border-gray-400 w-full pb-5 flex justify-between items-center w-full'>
              <div className='w-1/4'> DOB: </div>
              <input type='date' name='dob' id='dob' value={''} onChange={''} className='rounded-md w-3/4  focus:border-secondary-dark focus:ring focus:ring-secondary-dark focus:outline-none px-2'/>          
            </label>
            <div className='flex justify-between items-center w-full gap-2'>
              <legend className='flex justify-center items-center'>Sex:</legend>
              {/* <div className='flex w-3/4 gap-2 justify-end items-center text-gray-500'>
                <label htmlFor='male' className={`w-full p-2 rounded-2xl flex justify-center items-center grow border-2 ${sexValue == 'male'? 'border-secondary-dark':'border-gray-400'}`}>
                  <input id='male' type='radio' name='sex' checked={sexValue == 'male'} value='male' onChange={handleSexValueChange} className='peer appearance-none hidden'/>          
                  <div className={`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sexValue == 'male'? 'font-bold':''}`}> Male </div>
                </label>
                <label htmlFor='female' className={`w-full p-2 flex justify-center items-center grow rounded-2xl border-2 gap-2 ${sexValue == 'female'? 'border-secondary-dark':'border-gray-400'}`}>
                  <input id='female' type='radio' name='sex' checked={sexValue == 'female'} value='female' onChange={handleSexValueChange} className=' peer appearance-none hidden'/>
                  <div className= {`peer-checked:text-secondary-dark flex justify-center items-center  w-full ${sexValue == 'female'? 'font-bold':''}`}>Female</div>
                </label>
              </div> */}
            </div>
            <div className='w-full flex gap-12 justify-center items-center h-[48px] mt-4'>
              <button className='flex justify-center items-center h-[48px] bg-accent px-2 rounded-md'> Submit </button>
              <button onClick={closeModal} className='flex justify-center items-center min-h-[48px] border-2 border-black px-2 rounded-md'> Cancel </button>
            </div>
          </Form>
        
      </div>
  )} else return null
}

export default UpdateUsernameModal