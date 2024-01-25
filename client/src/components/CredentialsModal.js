import React from 'react'

const CredentialsModal = ({ children }) => {
  return(
      <main className={`
        min-w-max 
        w-3/4 
        max-w-lg
        min-h-max
        flex 
        flex-col 
        justify-start 
        items-center 
        my-8
        rounded-2xl
        bg-transparent
        blur-small
        shadow-2xl
        `}>
          { children }
      </main>
  )
}

export default CredentialsModal