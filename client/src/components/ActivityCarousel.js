import React, {  useState } from 'react'

const ActivityCard = () => {
  return(
    <div className='w-[90%] flex flex-col justify-center items-center'>
      <Date/>
      <Log />
      <button className='min-w-[44px] min-h-[44px] flex justify-center items-center bg-gray-200 mb-4'>
        Add
      </button>
    </div>
  )
}

const ActivityCarousel = ({ activity, referenceDate, setReferenceDate }) => {

  // Data required: 
  //  activity: [{date:{activityId:{data}},{date:{activityId:{data}},...}]
  //  setReferenceDate; Will update the reference date to account for the current card being displayed.

  const daysOfActivity = 15;
  const [currentIndex, setCurrentIndex] = useState(Math.floor(daysOfActivity / 2));

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1));
    const activeDate = activity[currentIndex].date
    setReferenceDate(activeDate)
    localStorage.setItem('refDate', JSON.stringify(activeDate))
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1));
    const activeDate = activity[currentIndex].date
    setReferenceDate(activeDate)
    localStorage.setItem('refDate', JSON.stringify(activeDate))
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative overflow-hidden">
        <button onClick={prevCard} className="px-4 py-2 bg-blue-500 text-white absolute bottom-4 left-4 z-10">
          Previous
        </button>
        <button onClick={nextCard} className="px-4 py-2 bg-blue-500 text-white absolute bottom-4 right-4 z-10 ">
          Next
        </button>
        <div
            className="flex transition-transform duration-300 ease-in-out relative"
            style={{ transform: `translateX(-${currentIndex * 100 }%)` }}
          >
            {Array.from({ length: totalCards }).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-48 border border-gray-400 text-black text-[24px] px-4"
              >
                <div className='bg-red-300 h-full'>
                </div>
              </div>
            ))}
            
        </div>
      </div>
    </div>
  );
};
  // const activity = [{key1:'value1'},{key2:'value2'},{key3:'value3'}]
  // const [dayIndex,setIndex] = useState(0)

  // const handleLeftClick = (e) => {
  //   e.preventDefault()
  //   if(dayIndex == 0) setIndex(activity.length-1)
  //   else setIndex(dayIndex-1)
    
  // }
  // const handleRightClick = (e) => {
  //   e.preventDefault()
  //   if(dayIndex == activity.length-1) setIndex(0)
  //   else setIndex(dayIndex+1)
  // }

  // return(
  //   <div className='w-screen flex relative'>
  //     <div className='max-w-max -left-[50%] flex absolute'>
  //       {
  //         activity.length? (
  //           activity.map( (day,index) => {
  //             return(
  //             <div className={`w-full shrink-0 pl-10 border-black border-2`} >
  //               Day { index + 1 }
  //             </div>
  //             )
  //           })
  //         ):null
  //       }
  //     </div>
  //     <button className='absolute top-0 left-0' onClick={handleLeftClick}>Left</button>
  //     <button className='absolute top-0 right-0' onClick={handleRightClick}>Right</button>
  //   </div>
  // )


export default ActivityCarousel

// const Date = () => {
  //   // capture the current timestamp, then parse it for the year(YYYY), month(MM), and day(DD)
  //   const timestampNowSring = Date()
  //   const timestampNowStringSplit = timestampNowSring.split(" ")
  //   const [ day, month, date, year, ...rest ] = timestampNowStringSplit
  //   const today = `${year}-${month}-${date}`
  //   // capture the date from the 'active' card in the following format: YYYY-MM-DD
  //   const referenceDate = 'YYYY-MM-DD'
  
  //   return(
  //     <div className='w-full border-2 border-red-800 flex justify-center items-center mb-4'>
  //       <div className='max-w-max flex flex-col justify-start items-start text-base min-h-[44px]'>
  //         <div className='flex justify-center items-center text-[10px]'>'Day'</div>
  //         <div className='flex justify-center items-center'>
  //           <div className='flex justify-center items-center'>'DD'</div>
  //           <div className='flex justify-center items-center'>'Month'</div>
  //         </div>
  //         <div className='flex justify-center items-center text-[10px]'>'Year'</div>
  //       </div>
  //       {referenceDate? <div className='grow flex justify-center items-center'>'Today'</div>:null}
  //     </div>
  //   )
  // }
  
  // const Record = ({ act }) => {
  //   return(
  //     <div className='w-full flex justify-center items-center my-2'>
  //       { act }
  //     </div>
  //   )
  // }
  
  // const Log = () => {
  //   const activity = []
  //   return(
  //     <div className='w-full flex flex-col justify-center items-center mb-4'>
  //       {
  //         activity.length? (
  //           activity.map( act => <Record act={act} />)
  //         ):<div>No Activity</div>
  //       }
  //     </div>
  //   )
  // }