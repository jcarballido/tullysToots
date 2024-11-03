import React from 'react'
import getDateCharacteristics from '../util/getDateCharacteristics'

const PetData = ({ pet }) => {

  const { pet_name, dob, sex } = pet

  const petDOB = dob.split('T')[0]
  const petDOBParsedArray = petDOB.split('-')
  const year = petDOBParsedArray[0]
  const month = petDOBParsedArray[1]
  const date = petDOBParsedArray[2]

  sex.replace(' ','')
  const sexSplit = sex.split('')
  // console.log('Sex split result', sexSplit)
  const firstLetter = sexSplit[0]
  const firstLetterToUpperCase = firstLetter.toUpperCase()
  sexSplit.splice(0,1,firstLetterToUpperCase)
  sexSplit.join()

  // const { paddedDate, monthName, fullYear } = getDateCharacteristics(dob)

  return (
    <div className="flex items-center border-b-[1px] border-gray-300 max-w-full shrink mb-2">
      <div className={`flex justify-between text-black w-full  rounded-lg gap-2`}>
        <div className="flex flex-col shrink w-1/2">
          <div type="text" className="text-black font-bold" >
            {pet_name}
          </div>
          <div className="flex gap-4 w-full justify-between">
            <fieldset className="flex flex-col ">
              <div className="text-gray-600 text-sm">Birthday:</div>
              <div>
                { `${month}/${date}/${year}` }
              </div>
              {/* <input type="date" value={dateValue} disabled={disabled} onChange={handleBirthdayChange} className='shrink' /> */}
            </fieldset>
            <fieldset className="basis-1/3">
              <div className="text-gray-600 text-sm">
                Sex:
              </div>
              <div>
                {sexSplit}
              </div>
            {/* <label className={`${sexValue === "male" ? 'border-black border-2':''}`}>
              MALE
              <input
                type="radio"
                name="sex"
                value="male"
                disabled={disabled}
                checked={sexValue === "male"}
                onChange={updateSex}
                className="invisible"
              />
            </label>    
            <label className={`${sexValue === "female" ? 'border-black border-2':''}`}>
              FEMALE
              <input
                type="radio"
                name="sex"
                value="female"
                disabled={disabled}
                checked={sexValue === "female"}
                onChange={updateSex}
                className="invisible"
              />
            </label> */}
          </fieldset>
        </div>
        </div>
      {/* <div className="flex gap-2 justify-center items-center">
        <button
          className="border-2 border-secondary-dark px-2 h-[48px] rounded-lg"
          // disabled={editMode.state}
          onClick={(e) => handleEdit(e, pet)}
        >
          Edit
        </button>
        <button className="border-2 border-red-500 px-2 h-[48px] rounded-lg" onClick={ (e) => handleUnlink(e,pet.pet_id)}>
          Unlink
        </button>
      </div> */}
      </div>
    </div>
    // <>
    //   <div className=''>
    //     {pet_name}
    //   </div> 
    //   <div className=''>
    //     {sex}
    //   </div> 
    //   <div className=''>
    //     { paddedDate }-{ monthName }- {fullYear }
    //   </div> 
    // </>
  )
}

export default PetData