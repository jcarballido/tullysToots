import { useState } from "react"

const useTextInput = (initialValue) => {
  const [ value, setValue ] = useState(initialValue)

  const handleChange = (event) => {
    event.preventDefault()
    setValue(event.target.value)
  }

  return(
    {value, onChange: handleChange}
  )
}

export default useTextInput