import React from 'react'
import getDateCharacteristics from '../util/getDateCharacteristics'

const PetData = ({ pet }) => {

  const { pet_name, dob, sex } = pet

  const { paddedDate, monthName, fullYear } = getDateCharacteristics(dob)

  return (
    <>
      <div>
        {pet_name}
      </div> 
        <div>
        {sex}
      </div> 
        <div>
        { paddedDate }-{ monthName }- {fullYear }
      </div> 
    </>
  )
}

export default PetData