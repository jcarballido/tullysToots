import { useState } from "react"

const useTextInput = (initialValue) => {
  const [ value, setValue ] = useState(initialValue)
  const [ infocus, setFocus ] = useState(false)
 
  const handleChange = (event) => {
    event.preventDefault()
    setValue(event.target.value)
  }

  const handleBlur = (event) => {
    setFocus(false)
  }

  const handleFocus = ( event ) => {
    setFocus(true)
  }

  return(
    {value, infocus, onChange: handleChange, onBlur: handleBlur, onFocus: handleFocus}
  )
}

export default useTextInput