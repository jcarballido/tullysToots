import React from "react"

const Checkbox =({id, setNewActivity, checked, activity, disabled, setEditableActivityMap, newRecord}) => {
  
  const handleCheck = () => {
    if(newRecord){
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
    } else{
      setEditableActivityMap( prevEditableMap => {
        const updatedMap = structuredClone(prevEditableMap)
        console.log('updatedMap:', updatedMap)
        const recordToUpdate = updatedMap.get(id)
        console.log('record to update: ', recordToUpdate)
        console.log('activity:', activity)
        recordToUpdate[activity] = !checked
        updatedMap.set(id,recordToUpdate)
        console.log('final updatedMap: ', updatedMap)
        return updatedMap
      })
    }    
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