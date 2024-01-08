import React from "react"

const Dashboard = ({ children }) => {
  return(
      <main className='flex w-3/4 min-h-5/6'>
          { children }
      </main>
  )
}

export default Dashboard