import React, { useEffect, useState } from "react";
import useTextInput from "../hooks/useTextInput";
import getDateCharacteristics from "../util/getDateCharacteristics";
import useAxiosPrivate from '../hooks/useAxiosPrivate'

const Pet = ({ pet, editMode, disabled, handleEditMode,setPetsArray, setEditMode }) => {
  const axiosPrivate = useAxiosPrivate()
  console.log("Pet info: ", pet);
  const { fullYear, paddedMonth, paddedDate } = getDateCharacteristics(pet.dob);
  const petNameInput = useTextInput(`${pet.pet_name}`);

  // const [year, setYear] = useState(fullYear);
  // const [month, setMonth] = useState(monthIndex + 1);
  const [dateValue, setDateValue] = useState(`${fullYear}-${paddedMonth}-${paddedDate}`);
  const [sexValue, setSexValue] = useState(pet.sex.trim());
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
    const newData = {
      petId: pet.pet_id,
      pet_name: petNameInput.value,
      dob: `${dateValue}`,
      sex: sexValue,
    };

    console.log('(Pet.js) Updated pet data being sent: ', newData)

    try{
      const result = await axiosPrivate.put('/account/updatePet',newData)
      console.log('(Pet.js) Result from saving to DB')
      setPetsArray( prevPetsArray => {
        const petsArrayClone = [...prevPetsArray]
        const newPetsArray = petsArrayClone.map( (petElement, index) => {
          if(petElement.pet_id == result.pet_id){
            console.log('(Pet.js) Matching pet element: ', petElement)
            return result
          }else{
            return petElement
          }
        })
        return newPetsArray
      })
      setEditMode({ state:false, petId:null })
    }catch(e){
      console.log('Occured in Pet component. Error attempting to save updated pet data:',e)
    }

  };

  const handleBirthdayChange = (e) => {
    const value = e.target.value;
    setDateValue(value);
  };

  // useEffect(() => {
  //   setDateValue(`${fullYear}-${monthIndex+1}-${date}`);
  // }, [pet]);

  return (
    <div className="flex flex-col text-black w-full">
      <div className="">
        <input type="text" className="text-black" disabled={disabled} {...petNameInput} />
        <fieldset className="flex max-w-full">
          Birthday:
          <input type="date" value={dateValue} disabled={disabled} onChange={handleBirthdayChange} />
        </fieldset>
        <fieldset>
          <label className={`${sexValue === "male" ? 'border-black border-2':''}`}>
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
          </label>
        </fieldset>
        {/* <input type='text' disabled={disabled} {...sex} /> */}
        <button
          className="disabled:bg-red-500"
          disabled={editMode.state}
          onClick={(e) => handleEditMode(e, pet.pet_id)}
        >
          Edit
        </button>
        {!disabled ? (
          <button className="" onClick={handleSave}>
            Save
          </button>
        ) : null}
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