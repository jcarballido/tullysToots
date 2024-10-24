import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../tailwind.css';
import Banner from '../components/Banner.js'
import Footer from '../components/Footer.js'
import useAuth from '../hooks/useAuth.js';
import returnSymbol from '../media/return.svg'
import NewPetModal from '../components/NewPetModal.js';

export const Dashboard = () => {
  
  const [ previousLocation, setPreviousLocation ] = useState('')
  const [ slide, setSlide ] = useState(false)
  const [ newPetModal, setNewPetModal ] = useState({ visible:false })
  const [ petsArray, setPetsArray ] = useState([])

  const { auth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const sendBack = (e) => {
    e.preventDefault()
    navigate(-1)
  }

  useEffect( () => {
    if(location?.state?.from){
      const previousLocationFilePath = location.state.from
      const previousLocationFilePathSplit = previousLocationFilePath.split('/')
      const previousPageName = previousLocationFilePathSplit[previousLocationFilePathSplit.length - 1] || null
      const previousPageNameCapitalized = previousPageName.charAt(0).toUpperCase() + previousPageName.slice(1)
      setPreviousLocation(previousPageNameCapitalized)
    }
  },[location])
  
  return(
    <div className='w-screen h-screen max-h-screen bg-secondary flex flex-col justify-start items-center relative overflow-hidden'>
      <Banner auth={auth} slide={slide} setSlide={setSlide}/>
      <div className='grow w-full flex items-center justify-center overflow-hidden'>
        <div className='w-full max-h-full grow flex flex-col items-center my-2 font-Latto overflow-hidden'>
          {
            previousLocation
            ? <div className='flex w-11/12 justify-start items-center gap-2' >
                <div className='flex items-center' onClick={sendBack}>
                  <img className='flex items-center h-[48px]' src={returnSymbol}/>
                  <div className='flex justify-center items-center text-lg font-bold'>{previousLocation}</div>
                </div>
              </div>          
            : null  
          }
          {/* <div className='w-full grow flex flex-col items-center justify-center overflow-hidden'> */}
            <div className='w-11/12 grow flex flex-col items-center justify-center border-2 border-black rounded-2xl mb-2 p-4 bg-primary overflow-hidden'>
              <div className='flex items-center justify-center text-xl font-bold' >USERNAME</div>
              
              <Outlet context={[petsArray, setPetsArray, setNewPetModal]}/>
            </div>
          {/* </div> */}
        </div>
      </div>
        
      <NewPetModal newPetModal={newPetModal} setNewPetModal={setNewPetModal} setPetsArray={setPetsArray}/>
      <Footer />
    </div>
  )
}
