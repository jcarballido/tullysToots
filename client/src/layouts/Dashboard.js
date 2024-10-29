import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import '../tailwind.css';
import Banner from '../components/Banner.js'
import Footer from '../components/Footer.js'
import useAuth from '../hooks/useAuth.js';
import returnSymbol from '../media/return.svg'
import NewPetModal from '../components/NewPetModal.js';
import EditPetModal from '../components/EditPetModal.js'
import UnlinkPetModal from '../components/UnlinkPetModal.js'
import UpdateUsernameModal from '../components/UpdateUsernameModal.js';
import UpdatePasswordModal from '../components/UpdatePasswordModal.js';
import AccountNavigation from '../components/AccountNavigation.js';
import AddPetModal from '../components/AddPetModal.js';

export const Dashboard = () => {
  
  const [ previousLocation, setPreviousLocation ] = useState('')
  const [ slide, setSlide ] = useState(false)
  const [ newPetModal, setNewPetModal ] = useState({ visible:false })
  const [ petsArray, setPetsArray ] = useState([])
  const [ unlinkPetModal,setUnlinkPetModal ] = useState({ visible:false, petId:null })
  const [ editPetModal, setEditPetModal ] = useState({ visible: false, pet: null })
  const [ updateUsernameModal, setUpdateUsernameModel ] = useState({ visible:false })
  const [ updatePasswordModal, setUpdatePasswordModal ] = useState({ visible:false })
  const [ addPetModal, setAddPetModal ] = useState({ visible: false })

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
      { auth?.accessToken
        ? <AccountNavigation slide={slide} setSlide={setSlide} from='activity' />
        : null
      }
      <div className='grow w-full flex items-start justify-center overflow-hidden'>
        <div className='w-full max-h-full grow flex flex-col items-center my-2 font-Lato overflow-hidden pb-4'>
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
              <div className='flex items-center justify-center text-2xl font-bold' >USERNAME</div>
              
              <Outlet context={[petsArray, setPetsArray, setNewPetModal, unlinkPetModal, setUnlinkPetModal, editPetModal, setEditPetModal, addPetModal, setAddPetModal]}/>
            </div>
          {/* </div> */}
        </div>
      </div>
      <EditPetModal editPetModal={editPetModal} setEditPetModal={setEditPetModal} setPetsArray={setPetsArray} />
      <UnlinkPetModal unlinkPetModal={unlinkPetModal} setUnlinkPetModal={setUnlinkPetModal} setPetsArray={setPetsArray} />
      {/* <NewPetModal newPetModal={newPetModal} setNewPetModal={setNewPetModal} setPetsArray={setPetsArray}/> */}
      <AddPetModal visible={addPetModal.visible} setAddPetModal={setAddPetModal} sendTo='/pets' />
      <UpdateUsernameModal updateUsernameModal={updateUsernameModal} setUpdateUsernameModel={setUpdateUsernameModel} />
      <UpdatePasswordModal updatePasswordModal={updatePasswordModal} setUpdatePasswordModal={setUpdatePasswordModal}  />
      <Footer />
    </div>
  )
}
