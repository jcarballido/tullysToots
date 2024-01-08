import React from "react"

const User = ({ username }) => {
  return(
      <div>
          {username || 'Username'}
      </div>
  )
}

export default User