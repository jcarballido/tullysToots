import React, { useState, useEffect } from 'react'

const PetMenu = () => {
  const [ name, setName ] = useState('')
  const [ petModalVisible, setPetModalVisible ] = useState(true) 

  useEffect( () => {
      const activePetId = localStorage.get('referencePetId')
      const activePetRecord = petIds.filter( petRecord => activePetId == petRecord.id)
      const activePetName = activePetRecord.name
      setName(activePetName)
  },[ petIds ])

  const toggleModal = (e) => {
    e.preventDefault()
    setPetModalVisible(!petModalVisible)
  }

  return(
      <div className='w-3/4 min-w-max flex justify-center items-center mb-4 border-2 border-blue-400 min-h-[44px]'>
          {name? `${name}'s Activity`:''}
          <div className='border-red-700 border-2 flex flex-col items-center justify-center'>
            {Array.from({ length:5 }).map((el,index) => {
                return(
                    <div className='border-2 border-black flex justify-center items-center'>
                        {index}
                    </div>
                )
            }
            )}
          </div>
      </div>
  )
}

export default PetMenu
