import React, { useState, useEffect } from 'react'

const PetSelector = ({ petIdArray }) => {
  const [ name, setName ] = useState('')

  useEffect( () => {
    const activePetId = localStorage.getItem('referencePetId')
    if(activePetId){
      const activePetRecord = petIdArray.filter( petRecord => activePetId == petRecord.id)
      const activePetName = activePetRecord.name
      setName(activePetName)
    }
  },[ petIdArray ])

  return(
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>
          {name? `${name}'s Activity`:''}
          {
            petIdArray
            ? petIdArray.map( (el,index) => <div>{index}</div>)
            : null 

          }
      </div>
  )
}

export default PetSelector