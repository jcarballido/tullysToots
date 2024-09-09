import React from 'react'

const StatusMessage = ({ message }) => {

  if(message?.status?.success || message?.status?.error){
    const keysArr = Object.keys(message?.status)
    const result = keysArr[0]
    
    return(
      <>
        { message.status[`${result}`] }
      </>
    )
  }

  else if(Object.keys(message).length == 0) {
    return null
  }

  else return <div> Error processing Status Message </div>
}

export default StatusMessage