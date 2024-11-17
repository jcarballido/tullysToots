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
import  axios, { axiosPrivate } from '../api/axios'
// import timestampParser from '../util/timestampParser'
// import axios from 'axios'
import AddPetModal from '../components/AddPetModal'
import ConfirmationModal from '../components/ConfirmationModal'
import TimeModal from '../components/TimeModal'

const Activity = () => { 

  const { auth } = useAuth()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

  const { referenceDate:initialReferenceDate, referencePetId:initialPetId } = useLoaderData() 
  const actionData = useActionData()
  const { idk, updatedPetIdArray } = actionData || {}

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
  const [addPetError, setAddPetError] = useState({status:'false'})
  const [ confirmationModal, setConfirmationModal ] = useState({visible:false, recordId:null})
  const [status,setStatus] = useState({ viewing: true, adding: false, updating: false })
  const [ timeModal, setTimeModal ] = useState({visible:false,new:false, recordId:null,time:''})
  const [ newActivity, setNewActivity ] = useState([])
  // console.log('Activity.js/ activity state:', [])
  useEffect( () => {
    // const activePetId = localStorage.getItem('referencePetId')
    // const petIdString = activePetId? activePetId.replace(/^"|"$/g, ''):null
    // const petId = petIdString? parseInt(petIdString):null
    // console.log('petIdArray: ',petIdArray)
    if(referencePetId && petIdArray){
      // console.log('Pet ID array:', petIdArray)
      const activePetRecord = petIdArray.filter( petRecord => {
        return petRecord.pet_id == referencePetId
      })
      // console.log('activePetRecord: ',activePetRecord)
      const activePetName = activePetRecord[0]
      // console.log('Active pet name: ', activePetName)
      if(activePetName) setName(activePetName['pet_name'])
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
      // const isoString = referenceDate.toISOString()
      // const isoStringSplit = isoString.split('T')
      // const dateCaptured = isoStringSplit[0]
      // console.log(dateCaptured)
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
        const { activityArray, petIdArray, singlePetId } = response.data 
        // console.log('Activity Array received from serve:', activityArray)
        if(singlePetId) {
          localStorage.setItem('referencePetId', JSON.stringify(singlePetId))
          setReferencePetId(singlePetId)
        }
        setActivity(activityArray)
        setPetIdArray(petIdArray)
        const localStorageReferencePetId = JSON.parse(localStorage.getItem('referencePetId')) || null
        // console.log('localStorageRefPetId:', localStorageReferencePetId)
        // console.log('referencePetId:', referencePetId)
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

  useEffect( () => {
    if(actionData?.status == 'success'){
      console.log('pet added!')
      console.log(updatedPetIdArray)
      setPetIdArray(actionData.updatedPetIdArray)
      setAddPetModal({visible:false})
    }
    if(actionData?.status == 'error'){
      console.log('Error adding pet:',actionData)
      setAddPetError({status:'true',message:'A pet with these same details already exsts. Cannot add at this time.'})
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

  const sendTimestamp = async() => {
    const currentTimestampFromClient = new Date()
    const timezoneOffset = currentTimestampFromClient.getTimezoneOffset()
    // console.log('currentTimestampClinet:', currentTimestampFromClient, '+', timezoneOffset)
    try{
        const response = await axios.post('activity/testEndpoint', { currentTimestampFromClient, timezoneOffset })
        const data = response.data
        // console.log('Data recieved back:', data)
    }catch(e){
        console.log(e)
    }
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
      console.log('Response from deletion:', response)
      const referenceDateActivity = response.data[0]
      setActivity(prevActivity => {
        const updatedActivityArray = prevActivity.map( dailyActivityLog => {
          const dailyActivityDate = Object.keys(dailyActivityLog)[0]
          const referenceDate = Object.keys(referenceDateActivity)[0]
          // console.log('dailyActivityDate:', dailyActivityDate)
          // console.log('ref ActivityDate:', referenceDate)
          if(dailyActivityDate == referenceDate){
            return referenceDateActivity
          }else{
            return dailyActivityLog
          }
        })
        // console.log('updated Act arr:', updatedActivityArray)
        return updatedActivityArray
      })
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
      setStatus({ viewing: true, adding: false, updating: false })
    }catch(e){
      console.log('ERROR deleting existing activity: ',e)
      setConfirmationModal(prev => { return {visible:false,activityId:null}})
      setStatus({ viewing: true, adding: false, updating: false })
    }
  }

  return(
    <main className='w-full grow flex flex-col justify-start items-center overflow-y-auto gap-8 mt-4'>
      {pendingInvitations ? <button  onClick={( ) => navigate('/acceptInvite')} >You have pending invites!</button>:null}
      <div className='flex gap-2 justify-center items-center text-black font-Fredoka text-2xl bg-accent rounded-2xl border-2 border-accent px-2' onClick={openPetSelectorModal}>
        <div className='rounded-lg '>{name ? `${name}'s Log`:''}</div>
      </div>
      {
        referencePetId
        ? <ActivityCarousel dateMap={dateMap} savedActivityMap={savedActivityMap} editableActivityMap={editableActivityMap} setEditableActivityMap={setEditableActivityMap} setActivity={setActivity} referencePetId={referencePetId} referenceDate={referenceDate} setReferenceDate={setReferenceDate} activity={activity} confirmationModal={confirmationModal} setConfirmationModal={ setConfirmationModal } deleteExistingActivity={deleteExistingActivity} status={status} setStatus={setStatus} setTimeModal={setTimeModal} newActivity={newActivity} setNewActivity={setNewActivity}/>
        : <button onClick={openAddPetModal}  >Add a new pet!</button>
      }
      <PetSelector petIdArray={petIdArray} referencePetId={referencePetId} setReferencePetId={ setReferencePetId } switchPetModal={switchPetModal} setSwitchPetModal={setSwitchPetModal} setAddPetModal={setAddPetModal} addPetModal={addPetModal}/>
      <AddPetModal visible={addPetModal.visible} setAddPetModal={ setAddPetModal } error={addPetError} setAddPetError={setAddPetError} />
      <ConfirmationModal confirmationModal={confirmationModal} setConfirmationModal={setConfirmationModal} deleteExistingActivity={deleteExistingActivity} setStatus={setStatus}/> 
      <TimeModal timeModal={ timeModal } setTimeModal={setTimeModal} setEditableActivityMap={ setEditableActivityMap } newActivity={newActivity} setNewActivity={setNewActivity} />
    </main>
  )
}

export default Activity

export const loader = () => {
  // Get exisiting reference date from local storage or set to the current date
  let localStorageReferenceDate = localStorage.getItem('referenceDate') || null
  // console.log('Loader determined ref date as:', localStorageReferenceDate)
  const dateFormatCheck = /^\d{4}-\d{2}-\d{2}$/
  localStorageReferenceDate = JSON.parse(localStorageReferenceDate)

  // console.log('Parsed local ref date:', localStorageReferenceDate)
  if(localStorageReferenceDate == null || !dateFormatCheck.test(localStorageReferenceDate)){
    // console.log('local ref date was either null or did not fit regex')
    // console.log('local ref date tested:',localStorageReferenceDate, 'typeof:', typeof(localStorageReferenceDate))
    // console.log('Regex check result:', dateFormatCheck.test(localStorageReferenceDate))
    localStorageReferenceDate = new Date()
    localStorageReferenceDate.setHours(localStorageReferenceDate.getHours()-(localStorageReferenceDate.getTimezoneOffset()/60))
    const toISOString = localStorageReferenceDate.toISOString()
    const stringSplit = toISOString.split('T')
    const dateCaptured = stringSplit[0]
    localStorageReferenceDate = dateCaptured
    // console.log('date captured in loader: ', dateCaptured)
    // const year = localStorageReferenceDate.getUTCFullYear()
    // const month = localStorageReferenceDate.getUTCMonth()
    // const paddedMonth = month < 10? (month + 1 == 10 ? '10':`0${month + 1}`): `${month + 1}`
    // const date = localStorageReferenceDate.getUTCDate()
    // const paddedDate = date < 10? `0${date}`:`${date}`
    // localStorage.setItem('referenceDate', JSON.stringify(`${year}-${paddedMonth}-${paddedDate}`))
    localStorage.setItem('referenceDate', JSON.stringify(`${dateCaptured}`))
  }else {
    // console.log('ref date present:', localStorageReferenceDate)
    // console.log('local ref date was not null and did fit regext')
    let newReferenceDate = new Date(localStorageReferenceDate)
    // newReferenceDate.setHours(newReferenceDate.getHours()-(newReferenceDate.getTimezoneOffset()/60))
    const toISOString = newReferenceDate.toISOString()
    // console.log('Loader refernce date found, converted to ISO string:', toISOString)
    const stringSplit = toISOString.split('T')
    const dateCaptured = stringSplit[0]
    localStorageReferenceDate = dateCaptured
    // let year = newReferenceDate.getUTCFullYear()
    let month = newReferenceDate.getUTCMonth()
    let date = newReferenceDate.getUTCDate()
    let paddedMonth
    let paddedDate = date
    // console.log('year,month,date:', year,month,date)
    if(newReferenceDate.getUTCMonth().toString().length != 2) {
          paddedMonth = month < 10? (month + 1 == 10 ? '10':`0${month + 1}`): `${month + 1}`
          // console.log('year,month,date:', year,paddedMonth,date)
          // newReferenceDate = new Date(`${year}`,`${paddedMonth}`,`${date}`)
          // console.log('updated ref date:', newReferenceDate.getUTCMonth())
        }
    if(newReferenceDate.getUTCDate().toString().length != 2) {
        paddedDate = `0${date}`
      //     newReferenceDate.setUTCMonth(paddedDate)
      //   }
    // console.log('date to store:',JSON.stringify(`${dateCaptured}`))
    }
    localStorage.setItem('referenceDate', JSON.stringify(`${dateCaptured}`))

  }

  // Get exisiting reference pet ID from local storage or set to null
  const referencePetIdLocalStorage = localStorage.getItem('referencePetId') || null
  const referencePetId = referencePetIdLocalStorage == 'undefined' || referencePetIdLocalStorage == 'null'  ? null : JSON.parse(referencePetIdLocalStorage)  

  // console.log('Reference date generated by loader: ', localStorageReferenceDate)

  return { referenceDate:localStorageReferenceDate, referencePetId}
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