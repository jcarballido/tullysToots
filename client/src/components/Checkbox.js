import React from "react"
import Drip from '../media/drops.svg'
import Poo from '../media/poo.svg'

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
    <label className='w-max relative flex items-center justify-center'>
      {
        disabled 
        ? <input type='checkbox' name={activity} checked={checked} className='appearance-none peer absolute invisible' disabled />
        : <input type='checkbox' name={activity} checked={checked} className='appearance-none peer absolute invisible' onChange={handleCheck} />
      }
      {/* <div className='peer-checked:opacity-100 peer-checked:border-green-700  border-2 border-red-700' >{activity.toUpperCase()}</div> */}
      <img className='w-[48px] opacity-25 peer-checked:opacity-100' src={activity == 'poo'? Poo:Drip}/>
    </label>
  )
}

export default Checkbox