import React, { useEffect, useState, useContext } from 'react'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate
} from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ActivityCarousel from '../components/ActivityCarousel'
import PetSelector from '../components/PetSelector'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { axiosPrivate } from '../api/axios'
// import timestampParser from '../util/timestampParser'
// import axios from 'axios'
import AddPetModal from '../components/AddPetModal'
import ConfirmationModal from '../components/ConfirmationModal'

const Activity = () => { 

  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const { referenceDate:initialReferenceDate, referencePetId:initialPetId } = useLoaderData() 
  const actionData = useActionData()
  const { status, updatedPetIdArray } = actionData || {}

  const [ activity, setActivity ] = useState([])
  const [ dateMap, setDateMap ] = useState(new Map())
  const [ savedActivityMap, setSavedActivityMap ] = useState(new Map())
  const [ editableActivityMap, setEditableActivityMap ] = useState(new Map())
  const [ referenceDate, setReferenceDate ] = useState(initialReferenceDate)
  const [ referencePetId, setReferencePetId ] = useState(initialPetId)
  const [ petIdArray, setPetIdArray ] = useState([])
  const [ addPetModal, setAddPetModal ] = useState({ visible: false })
  const [ pendingInvitations, setPendingInvitations ] = useState(false)
  const [ switchPetModal, setSwitchPetModal ] = useState({visible:false})
  const [ name, setName ] = useState('')
  const [addPetError, setAddPetError] = useState(false)
  const [ confirmationModal, setConfirmationModal ] = useState({visible:false, recordId:null})

  console.log('activity:', activity)

  useEffect( () => {
    // const activePetId = localStorage.getItem('referencePetId')
    // const petIdString = activePetId? activePetId.replace(/^"|"$/g, ''):null
    // const petId = petIdString? parseInt(petIdString):null
    // console.log('petIdArray: ',petIdArray)
    if(referencePetId && petIdArray){
      const activePetRecord = petIdArray.filter( petRecord => {
        return petRecord.id == referencePetId
      })
      // console.log('activePetRecord: ',activePetRecord)
      const activePetName = activePetRecord[0]
      // console.log('Active pet name: ', activePetName)
      if(activePetName) setName(activePetName['petName'])
      // setName(activePetName)
    }
  },[ referencePetId, petIdArray ])

  useEffect( () => {
    const abortController = new AbortController()
    const getSinglePetId = async() => {
      try{
        // console.log('Reference Pet Id: ', referencePetId)
        const response = await axiosPrivate.get('/account/getSinglePetId',{ signal:abortController.signal })
        const fetchedPetId = response.data.singlePetId
        // console.log('Response: ', response)

        if(!fetchedPetId) return console.log('No existing pet links found')

        localStorage.setItem('referencePetId', JSON.stringify(fetchedPetId))
        return setReferencePetId(fetchedPetId)
      }catch(e){
        return console.log('Error getting single pet id: ',e)
      }
    }

    if(!referencePetId) getSinglePetId()

    return () => abortController.abort()
  },[])

  useEffect( () => {
    const abortController = new AbortController()

    const getActivity = async() => {
      const timeWindowObj = { daysBefore:3, daysAfter:3 }
      const parameters = {
        referencePetId,
        referenceDate, 
        timeWindowObj
      }
      const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
      // Fetch activity for the reference date and pet ID
      try{
        const response = await axiosPrivate.get(`/activity/get?data=${encodedParameters}`,{ signal:abortController.signal })
        if(response.status == 204) return console.log('No actively linked pets.')
        console.log('Response recieved from activity request: ', response.data)
        const { activityArray, petIdArray } = response.data 
        setActivity(activityArray)
        setPetIdArray(petIdArray)
        const localStorageReferencePetId = JSON.parse(localStorage.getItem('referencePetId')) || null
        console.log('localStorageRefPetId:', localStorageReferencePetId)
        console.log('referencePetId:', referencePetId)
        if( localStorageReferencePetId != referencePetId) localStorage.setItem('referencePetId', JSON.stringify(referencePetId))  
        return 
      }catch(e){
        console.log('Error from attempting to get data with encoded parameters: ',e)
        return e
      }
    }
    if(referencePetId){
      getActivity()

    }
    return () => abortController.abort()

  },[referencePetId])

  useEffect( () => {
    const workingDateMap = new Map()
    const workingActivityMap = new Map()
    // activity = [ {date1: [{...act1},...]}, { date2: [ {...act2},...]} ]
    if(activity?.length > 0){
      activity.forEach( date => {
      const [ dateString, activityArray ] = Object.entries(date)[0]
      if(activityArray.length == 0){
        workingDateMap.set(dateString, activityArray)
      }else{
        activityArray.forEach( loggedActivity => {
          const existingDateActivity = workingDateMap.get(dateString) || []
          existingDateActivity.push(loggedActivity.activity_id)
          workingDateMap.set(dateString, existingDateActivity)
          workingActivityMap.set(loggedActivity.activity_id, loggedActivity)
        })
      }})
      setDateMap(workingDateMap)
      setSavedActivityMap(workingActivityMap)
      setEditableActivityMap(workingActivityMap)
    }
    
  },[activity])

  // console.log('Date map:', dateMap)


  useEffect( () => {
    if(actionData?.status == 'success'){
      console.log('pet added!')
      console.log(updatedPetIdArray)
      setPetIdArray(actionData.updatedPetIdArray)
      setAddPetModal({visible:false})
    }
    if(actionData?.status == 'error'){
      console.log('Error adding pet')
      setAddPetError(true)
    }
  },[ actionData ])

  // useEffect( () => {
  //   if(addedPetId) setReferencePetId(addedPetId)
  // },[addedPetId])

  const openAddPetModal = (e) => {
    e.preventDefault()
    setAddPetModal({ visible: true })
  }

  const openPetSelectorModal = (e) => {
    e.preventDefault()
    setSwitchPetModal({visible:true})
  }

  const deleteExistingActivity = async(event, activityId, dateString) => {
    event.preventDefault()
    // Send delete request
    const parameters = {
      activityId,
      referencePetId,
      referenceDate:dateString,
    }
    const encodedParameters = encodeURIComponent(JSON.stringify(parameters))
    try{
      const response = await axiosPrivate.delete(`/activity/delete?data=${encodedParameters}`)
      const referenceDateActivity = response.data[0]
      setActivity(prevActivity => {
        const updatedActivityArray = prevActivity.map( dailyActivityLog => {
          const dailyActivityDate = Object.keys(dailyActivityLog)[0]
          const referenceDate = Object.keys(referenceDateActivity)[0]
          if(dailyActivityDate == referenceDate){
            return referenceDateActivity
          }else{
            return dailyActivityLog
          }
        })
        // console.log('')
        return updatedActivityArray
      })
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
    }catch(e){
      console.log('ERROR deleting existing activity: ',e)
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
    }
  }

  return(
    <main className='w-full grow flex flex-col justify-start items-center overflow-y-auto gap-8 mt-4'>
      {pendingInvitations ? <button  onClick={( ) => navigate('/acceptInvite')} >You have pending invites!</button>:null}
      <div className='flex gap-2 justify-center items-center text-black font-Fredoka text-2xl bg-secondary-light rounded-2xl border-2 border-accent px-2' onClick={openPetSelectorModal}>
        <div className='rounded-lg '>{name ? `${name}'s `:''}</div>
        <div>Log</div>
      </div>
      {
        referencePetId
        ? <ActivityCarousel dateMap={dateMap} savedActivityMap={savedActivityMap} editableActivityMap={editableActivityMap} setEditableActivityMap={setEditableActivityMap} setActivity={setActivity} referencePetId={referencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} activity={activity} confirmationModal={confirmationModal} setConfirmationModal={ setConfirmationModal } deleteExistingActivity={deleteExistingActivity} />
        : <button onClick={openAddPetModal}>Add a new pet!</button>
      }
      <PetSelector petIdArray={petIdArray} referencePetId={referencePetId} setReferencePetId={ setReferencePetId } switchPetModal={switchPetModal} setSwitchPetModal={setSwitchPetModal} setAddPetModal={setAddPetModal} addPetModal={addPetModal}/>
      <AddPetModal visible={addPetModal.visible} setAddPetModal={ setAddPetModal } error={addPetError} setAddPetError={setAddPetError} />
      <ConfirmationModal confirmationModal={confirmationModal} setConfirmationModal={setConfirmationModal} deleteExistingActivity={deleteExistingActivity}/> 
    </main>
  )
}

export default Activity

export const loader = () => {
  // Get exisiting reference date from local storage or set to the current date
  let referenceDate = localStorage.getItem('referenceDate') || null
  if(!referenceDate){
    referenceDate = new Date()
    localStorage.setItem('referenceDate', JSON.stringify(referenceDate.toLocaleString().split(',')[0]))
  }

  // Get exisiting reference pet ID from local storage or set to null
  const referencePetIdLocalStorage = localStorage.getItem('referencePetId') || null
  const referencePetId = referencePetIdLocalStorage == 'undefined' || referencePetIdLocalStorage == 'null'  ? null : JSON.parse(referencePetIdLocalStorage)  

  return { referenceDate, referencePetId}
}

export const action = async({ request }) => {
  const formData = await request.formData()
  const name = formData.get('name')
  const dob = formData.get('dob')
  const sex = formData.get('sex')

  const petInfo = { name,dob, sex }

  try {
    const response = await axiosPrivate.post('/account/addPet', petInfo)
    const { status, updatedPetIdArray } = response.data
    return {status, updatedPetIdArray }
  } catch (err) {
    console.log('Error attempting to add a pet: ', err)
    const { status, message } = err.response.data
    return { status, message }
  }
}