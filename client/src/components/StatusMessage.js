import React from 'react'

const StatusMessage = ({ message }) => {

  if(message?.success || message?.error){
    const keysArr = Object.keys(message)
    const result = keysArr[0]
    
    return(
      <>
        { message[`${result}`] }
      </>
    )
  }

  else if(Object.keys(message).length == 0) {
    return null
  }

  else return <div> Error processing Status Message </div>
}

export default StatusMessage