import React from 'react'

const TimePicker = () => {
  const hours = [1,2,3,4,5,6,7,8,9,10,11,12]
  const minutes = Array.from({length:60}, (_,index) => {
  if(index.toString().length == 1){
    return `0${index}`
  }
  return index.toString()
})
  return (
    <div>TimePicker</div>
  )
}

export default TimePicker