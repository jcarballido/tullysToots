import React from 'react'

const PetData = ({ pet }) => {

  const { name, dob, sex } = pet
  return (
    <>
      <div>
        {name}
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