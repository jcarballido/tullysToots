import React from 'react'

const PetData = ({ pet }) => {

  const { pet_name, dob, sex } = pet
  return (
    <>
      <div>
        {pet_name}
      </div> 
        <div>
        {sex}
      </div> 
        <div>
        {dob}
      </div> 
    </>
  )
}

export default PetData