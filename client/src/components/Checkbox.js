import React,{ useEffect, useState } from "react"

const Checkbox =({id, setNewActivity, checked, activity}) => {
  
  const handleCheck = () => {
    setNewActivity( prevNewActivity => {
      const updatedNewActivity = prevNewActivity.map( newActivity => {
        if(newActivity.newId != id){
          return newActivity
        }else{
          newActivity[activity] = !newActivity[activity]
          return newActivity
        }
      })
      return updatedNewActivity
    })
  }

  return(
    <label className=' border-2 border-solid border-gray-700 w-full relative'>
      <input type='checkbox' name={activity} checked={checked} className='appearance-none peer absolute invisible' onChange={handleCheck} />
      <div className='peer-checked:opacity-100 opacity-25 border-2 border-solid border-purple-500' >{activity.toUpperCase()}</div>
    </label>
  )
}

export default Checkbox