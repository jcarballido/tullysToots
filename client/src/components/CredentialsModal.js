import React from 'react'

const CredentialsModal = ({ children }) => {
  return(
      <main className='min-w-max w-full max-w-lg flex flex-col border-2 border-black justify-center items-center px-4 my-8'>
          { children }
      </main>
  )
}

export default CredentialsModal