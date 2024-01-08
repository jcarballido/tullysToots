import React from "react";

const Content = ({ active }) => {
  return(
      <div className='min-w-max grow-1'>
          {active == 'Profile'? <Profile />:null}
          {active == 'Pets'? <Pets />:null}
          {active == 'Invitations'? <Invitations />:null}
      </div>
  )
}

export default Content