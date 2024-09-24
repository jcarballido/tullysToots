import React from 'react'

const CredentialsModal = ({ children }) => {
  return(
      <main className={`w-3/4 max-w-lg grow flex flex-col justify-start items-center`}>
          { children }
      </main>
  )
}

export default CredentialsModal