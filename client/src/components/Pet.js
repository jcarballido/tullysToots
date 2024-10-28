import React, { useEffect, useState } from "react";
import useTextInput from "../hooks/useTextInput";
import getDateCharacteristics from "../util/getDateCharacteristics";
import useAxiosPrivate from '../hooks/useAxiosPrivate'

const Pet = ({ pet, disabled, handleEditMode,setPetsArray, index, unlinkPetModal, setUnlinkPetModal, editPetModal, setEditPetModal }) => {
  const axiosPrivate = useAxiosPrivate()
  // console.log("Pet info: ", pet);
  // const { fullYear, paddedMonth, paddedDate } = getDateCharacteristics(pet.dob);
  const petDOB = pet.dob.split('T')[0]
  const petDOBParsedArray = petDOB.split('-')
  const year = petDOBParsedArray[0]
  const month = petDOBParsedArray[1]
  const date = petDOBParsedArray[2]
  const petNameInput = useTextInput(`${pet.pet_name}`);

  const sex = pet.sex
  sex.replace(' ','')
  const sexSplit = sex.split('')
  // console.log('Sex split result', sexSplit)
  const firstLetter = sexSplit[0]
  const firstLetterToUpperCase = firstLetter.toUpperCase()
  sexSplit.splice(0,1,firstLetterToUpperCase)
  sexSplit.join()
  // console.log('Sex join result', sexSplit)

  // const [year, setYear] = useState(fullYear);
  // const [month, setMonth] = useState(monthIndex + 1);
  // const [dateValue, setDateValue] = useState(`${fullYear}-${paddedMonth}-${paddedDate}`);
  const [sexValue, setSexValue] = useState(pet.sex.trim());
  const [ editMode, setEditMode ] = useState({state:false, petId:null})

  // const [ dateValue, setDate ] = useState(`${monthIndex+1}/${date}`)
  // const dob = useTextInput(`${monthName} ${date},${fullYear}`)
  // const sex = useTextInput(pet.sex)
  // If 'edit' is unclicked, inputs are disabled
  // If 'edit' is clicked, inputs become enabled.
  // If other pet is being edited, cannot edit current pet,

  // const handleYearChange = (e) => {
  //   const target = e.target;
  //   const value = parseInt(target.value) || 0;
  //   setDateValue(value);
  // };
  // const handleMonthChange = (e) => {
  //   const target = e.target;
  //   const value = parseInt(target.value) || 0;
  //   setDateValue(value);
  // };
  // const handleDateChange = (e) => {
  //   const target = e.target;
  //   const value = parseInt(target.value) || 0;
  //   setDateValue(value);
  // };
  const updateSex = (e) => {
    setSexValue(e.target.value);
  };

  const handleSave = async() => {
    // const newData = {
    //   petId: pet.pet_id,
    //   pet_name: petNameInput.value,
    //   dob: `${dateValue}`,
    //   sex: sexValue,
    // };

    // console.log('(Pet.js) Updated pet data being sent: ', newData)

    // try{
    //   const result = await axiosPrivate.put('/account/updatePet',newData)
    //   console.log('(Pet.js) Result from saving to DB')
    //   setPetsArray( prevPetsArray => {
    //     const petsArrayClone = [...prevPetsArray]
    //     const newPetsArray = petsArrayClone.map( (petElement, index) => {
    //       if(petElement.pet_id == result.pet_id){
    //         console.log('(Pet.js) Matching pet element: ', petElement)
    //         return result
    //       }else{
    //         return petElement
    //       }
    //     })
    //     return newPetsArray
    //   })
    //   setEditMode({ state:false, petId:null })
    // }catch(e){
    //   console.log('Occured in Pet component. Error attempting to save updated pet data:',e)
    // }

  };

  const handleBirthdayChange = (e) => {
    // const value = e.target.value;
    // setDateValue(value);
  };

  // useEffect(() => {
  //   setDateValue(`${fullYear}-${monthIndex+1}-${date}`);
  // }, [pet]);

  const handleUnlink = (e, petId) => {
    e.preventDefault()
    setUnlinkPetModal({ visible:true, petId })
  }
  const handleEdit = (e,pet) => {
    setEditPetModal({ visible:true, pet })
  }

  return (
    <div className="flex items-center border-b-[1px] border-gray-300 max-w-full shrink">
      <div className={`flex justify-between text-black w-full  rounded-lg my-2 p-2 ${index % 2 == 0 ? 'bg-secondary-light':'bg-secondary'}`}>
        <div className="flex flex-col shrink w-1/2">
          <div type="text" className="text-black font-bold my-2" >
            {pet.pet_name}
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
        <div className="flex gap-2 justify-center items-center">
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
        </div>
      </div>
    </div>
  );
};

export default Pet;

        {/* <input
        className="max-w-fit"
          type="text"
          disabled={disabled}
          value={month}
          onChange={handleMonthChange}
        />
        /
        <input
          className="max-w-fit"
          type="text"
          disabled={disabled}
          value={dateValue}
          onChange={handleDateChange}
        />
        /
        <input
          className="max-w-fit"
          type="text"
          disabled={disabled}
          value={year}
          onChange={handleYearChange}
        /> */}