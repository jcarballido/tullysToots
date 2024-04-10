import React,{ useState } from "react"

const Checkbox =({display}) => {
  const [checked, setChecked] = useState(true)
  const handleCheck = () => {
    setChecked(prev => !prev)
  }
  return(
    <label className=' border-2 border-solid border-gray-700 w-full relative'>
      <input type='checkbox' name={display} checked={checked} className='appearance-none peer absolute invisible' onChange={handleCheck} />
      <div className='peer-checked:opacity-100 opacity-25 border-2 border-solid border-purple-500' >{`${display.toUpperCase()}`}</div>
    </label>
  )
}

export default Checkbox