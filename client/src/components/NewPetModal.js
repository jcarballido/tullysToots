import React, { useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import getDateCharacteristics from '../util/getDateCharacteristics';
import useTextInput from '../hooks/useTextInput';

const NewPetModal = ({ newPetModal, setNewPetModal, setPetsArray }) => {

  // const { fullYear, paddedMonth, paddedDate } = getDateCharacteristics(new Date())

  const currentDate = new Date()
  const currentDateISOFormat = currentDate.toISOString().split('T')[0]

  const [ dateValue, setDateValue ] = useState(`${currentDateISOFormat}`)
  const [ sexValue, setSexValue ] = useState('')
  const [ validFields, setValidFields ] = useState(true)

  const axiosPrivate = useAxiosPrivate()
  const newPetInput = useTextInput()

  const handleBirthdayChange = (e) => {
    const value = e.target.value;
    setDateValue(value);
  };

  const handleSave = async() => {
    const newData = {
      pet_name: newPetInput.value,
      dob: `${dateValue}`,
      sex: sexValue,
    };

    console.log('(NewPetModal.js) New pet data being sent: ', newData)

    try{
      const resultFromAddingNewPet = await axiosPrivate.post('/account/addPet',newData)
      console.log('(NewPetModal.js) Result from saving to DB: ', resultFromAddingNewPet)
      const result = await axiosPrivate.get('/account/getPets')
      console.log('(NewPetModal.js) Result from getting pets: ', result.data.success)
      // return {success: result}
      setPetsArray([...result.data.success])
      setNewPetModal({ visible:false })
    }catch(e){
      console.log('Occured in Pet component. Error attempting to save updated pet data:',e)
    }

  };

  const updateSex = (e) => {
    setSexValue(e.target.value);
  };

  useEffect(() => {
    if(newPetInput.value != '' && dateValue != '' && sexValue != '') setValidFields(true)
    else setValidFields(false)
  },[newPetInput.value,dateValue,sexValue])

  if(newPetModal.visible){

  return (
    <div className={`absolute inset-0 flex justify-center items-start text-black font-Fredoka text-2xl z-40 backdrop-grayscale backdrop-blur-sm`}> 
      <div className={`z-50 bg-gray-400 text-black top-[150px] transition duration-300 ease-in ${newPetModal.visible? 'opaque-100 scale-y-100':'opaque-0 scale-y-0'} `}>
        <input type="text" className="text-black" {...newPetInput} />
        <fieldset className="flex max-w-full">
          Birthday:
          <input type="date" value={dateValue} onChange={handleBirthdayChange} />
        </fieldset>
        <fieldset>
          <label className={`${sexValue === "male" ? 'border-black border-2':''}`}>
            MALE
            <input
              type="radio"
              name="sex"
              value="male"
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
              checked={sexValue === "female"}
              onChange={updateSex}
              className="invisible"
            />
          </label>
        </fieldset>
        <button className="" onClick={handleSave} disabled={validFields == true}  >
          Save
        </button>
        <button className="" onClick={() => setNewPetModal({visible:false})}>
          Cancel
        </button>
      </div>
    </div>
  )} else null
  
}

export default NewPetModal