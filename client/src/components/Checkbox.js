import React from "react"

const Checkbox =({id, setNewActivity, checked, activity, disabled, setEditableActivityMap}) => {
  
  const handleCheck = () => {
   setEditableActivityMap( prevEditableMap => {
      const updatedMap = structuredClone(prevEditableMap)
      const recordToUpdate = updatedMap.get(id)
      recordToUpdate[activity] = !checked
      updatedMap.set(id,recordToUpdate)
      return updatedMap
    })
    // setNewActivity( prevNewActivity => {
    //   const updatedNewActivity = prevNewActivity.map( newActivity => {
    //     if(newActivity.newId != id){
    //       return newActivity
    //     }else{
    //       newActivity[activity] = !newActivity[activity]
    //       return newActivity
    //     }
    //   })
    //   return updatedNewActivity
    // })
  }

  return(
    <label className=' border-2 border-solid border-gray-700 w-full relative'>
      {
        disabled 
        ? <input type='checkbox' name={activity} checked={checked} className='appearance-none peer absolute invisible' disabled />
        : <input type='checkbox' name={activity} checked={checked} className='appearance-none peer absolute invisible' onChange={handleCheck} />
      }
      <div className='peer-checked:opacity-100 peer-checked:border-green-700  border-2 border-red-700' >{activity.toUpperCase()}</div>
    </label>
  )
}

export default Checkbox