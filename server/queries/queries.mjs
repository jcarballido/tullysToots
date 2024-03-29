import pg from 'pg'
import sqlText from './sqlText.mjs'
// import dotenv from 'dotenv/config'
// import timestampParser from '../../client/src/util/timestampParser.js'
import util from 'util'

const { Pool } = pg

const pool = new Pool()

const parse = (timestamp) => {
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const monthNames = ['January','February','March','April','May','June','July','August','Septemeber','October','November','Decemeber']
  const convertedDate = new Date(timestamp)
  const fullYear = convertedDate.getFullYear()
  const monthIndex = convertedDate.getMonth()
  const monthName = monthNames[monthIndex]
  const date = convertedDate.getDate()
  const dayIndex = convertedDate.getDay()
  const dayName = dayNames[dayIndex]
  return {
    year:fullYear,
    monthIndex,
    monthName,
    date,
    dayIndex,
    dayName
  }
}

// OWNER QUERIES
// 'Insert into table' operations...
// const addOwner = async(ownerData) => {
//   const { email, passwordHash, refreshToken } = ownerData
//   // Single query
//   const result = await pool.query(sqlText.insertIntoText('owners'),[email,passwordHash,refreshToken])
//   return result
// }

const addPetOwnerLink = async(ownerId,petIdsArray) => {
  //const seeText = sqlText.insertIntoText('pet_owners')
  //console.log(seeText)
  const result = await pool.query(sqlText.insertIntoText('pet_owners',petIdsArray),[ownerId,true,...petIdsArray])
  return result
}

const addActivity = async(petId, ownerId, timestampWithoutTZ, pee, poo) => {
  const result = await pool.query(sqlText.insertIntoText('activities'),[petId, ownerId, timestampWithoutTZ, pee, poo])
  const resultId = result.rows[0].activity_id
  return resultId
}

const getPasswordHash = async(ownerId) => {
  const result = await pool.query(sqlText.getPasswordHashText,[ownerId])
  const passwordHash = result.rows[0].password_hash
  return passwordHash
}

const addInvitationLink = async(...args) => {
  console.log('addInvitationLink arguemnts: ', args)
  if(args.length > 2){
    try{
      const result = await pool.query(sqlText.insertIntoText('invitations'),args)
      return result
    }catch(e){
      console.log('Error in queries.mjs, line 29',e)
      return e
    }
  }else{
    try{
      console.log('Length less than 3 => ','args[0]: ',args[0],'args[1]: ',args[1])
      const result = await pool.query(sqlText.insertIntoText('invitations'),[args[0],null,args[1]])
      return result
    }catch(e){
      console.log('Error in queries.mjs, line 37',e)
      return e
    }
  }
}

// Need to break up adding pet to 'pets' table and creating owner link.
const addPet = async(petName,dob,sex) => {
  //const ownerEmail = ownerAndPetData.email
  // console.log(ownerEmail)
  // const ownerId = await getOwnerId(ownerEmail)
  // console.log(ownerId)
  // const petName = ownerAndPetData.petName
  //console.log(petName)
  try{
    const result = await pool.query(sqlText.insertIntoText('pets'),[ petName,dob,sex ])
    const petId = result.rows[0].pet_id
    return petId
  }catch(e){
    return e
  }
  
  // console.log('This is the result from inserting pet name => ', petId)
  //return await addPetOwnerLink(ownerId,petId)
  // return 'check console log'
}

// "Query from table" operations
const getOwnerId = async(identifierNameString, identifier) => {
  //const email = ownerData.email
  //console.log('Line 62 Queries',email)
  try{
    const result = await pool.query(sqlText.getOwnerText(identifierNameString),[identifier])
    //console.log('Here\'s the SQL text: ',sqlText.getOwnerText())
    //console.log(result)
    const ownerId = result.rows[0].owner_id
    // console.log(ownerId)
    return ownerId
  }catch(e){
    return null
  }
}

const getOwnerIdFromEmail = async(email) => {
  //const email = ownerData.email
  //console.log('Line 62 Queries',email)
  try{
    const result = await pool.query(sqlText.getOwnerIdFromEmailText(),[email])
    //console.log('Here\'s the SQL text: ',sqlText.getOwnerText())
    //console.log(result)
    const ownerId = result.rows[0].owner_id
    // console.log(ownerId)
    return ownerId
  }catch(e){
    return null
  }
}

const getSingleActivePetId = async( ownerId ) => {
  try{
    const result = await pool.query(sqlText.getSingleActivePetId, [ ownerId ])
    console.log('Result from query: ',result)
    return result.rows[0].pet_id
  }catch(e){
    return null
  }
}

const getRefreshToken = async(identifier) => {
  try{
    //if(typeof identifier == 'number'){
      const result = await pool.query(sqlText.getRefreshTokenFromOwnerIdText, [ identifier ])
      console.log('Get refresh token query result: ', result)
      return result.rows[0].refresh_token
    // }else{
    //   const result = await pool.query(sqlText.getRefreshTokenFromUsernameText, [ ownerId ])
    //   console.log('Get refresh token query result: ', result)
    //   return result.rows[0].refresh_token
    // }
  }catch(e){
    return null
  }
}

const getResetToken = async(resetToken) => {
  try{
    const result = await query.pool(sqlText.getResetTokenText,[ resetToken ])
    return result
  }catch(e){
    return e
  }
}

const getEmail = async(ownerId) => {
  const result = await query.pool(sqlText.getEmail, [ ownerId ])
  return result.rows[0].email
}

const getPetId = async(petName,dob,sex) => {
  try{
    const result = await pool.query(sqlText.getPetIdText, [petName,dob,sex] )
    //console.log('Here\'s the SQL text: ',sqlText.getOwnerText())
    //console.log(result)
    if(result.rowCount == 1){
      const petId = result.rows[0].pet_id
      return petId
    }else{
      return null
    }
  }catch(e){
    return e
  }
}

const getInvitationId = async(invitationToken) => {
  const result = await query.pool(sqlText.getInvitationTokenText, [ invitationToken ])
}
 
// 'Update' operations
const updateOwner = async(updatedData) => {
  try{
    const ownerId = updatedData.ownerId
    const [ ...fields ] = updatedData.fields
    console.log('Fields => ',fields)
    const [ ...newValues ] = updatedData.newValues
    console.log('newValues => ',newValues)

    // Two queries:
    // 1. Get ownerId
    // const resultOwner = await pool.query(sqlText.getOwnerText(),[ identifier ])
    // const ownerId = resultOwner.rows[0].owner_id
    console.log('ownerId =>', ownerId)
    //2. Pass in owner ID that needs updating
    // console.log("Sql Text =>", sqlText.updateText('owners',fields,'owner_id'))
    const result = await pool.query(sqlText.updateText('owners',fields,'ownerId'),[...newValues,ownerId])
    console.log("Result from attempting to update owner: ",result)
    return result
  }catch(e){
    return e
  }
  
}

const updatePet = async(updatedData) => {
  const petId = updatedData.petId
  // const email = updatedData.email
  const [ ...fields ] = updatedData.fields
  // console.log('Fields => ',fields)
  const [ ...newValues ] = updatedData.newValues
  //console.log('newValues => ',newValues)

  // Two queries:
  // 1. Get petIdcarballidoj92@gmail.com
  //const resultOwner = await pool.query(sqlText.getOwnerText(),[email])
  //const ownerId = resultOwner.rows[0].owner_id
  //console.log('ownerId =>', ownerId)
  //2. Pass in owner ID that needs updating
  //console.log("Sql Text =>", sqlText.updateText('owners',fields,'owner_id'))
  const result = await pool.query(sqlText.updateText('pets',fields,'petId'),[...newValues,petId])
  // console.log(result)
  return result
}

const updateActivity = async(updatedActivityArray, petId) => {
  const activityId = updatedActivityArray.petId
  // const email = updatedData.email
  const [ ...fields ] = updatedActivityArray.fields
  // console.log('Fields => ',fields)
  const [ ...newValues ] = updatedActivityArray.newValues
  const result = await pool.query(sqlText.updateText('activites',fields, 'activity_id'),[...newValues, activityId])
  if(!result.rowCount) return result.send('ERROR: Did not update activity')
  return result.send('Successfully updated activity')
}

// 'Remove' operations
const deactivatePetOwnerLink = async( ownerId,petId ) => {
  const result = await pool.query(sqlText.deactivatePetOwnerLinkText(),[ownerId,petId])
  return result
}

const getOwnersPetIds = async(ownerId) => {
  const result = await pool.query(sqlText.getOwnersPetIdsText(), [ownerId])
  console.log('getOwnersPetIds result: ', result)
  const petIdsArr = result.rows.map(row => {return {id:row.pet_id, petName:row.pet_name}})
  // May not be needed
  // const filteredPetIdsArray = petIdsArr.filter( petId => !petId)
  return petIdsArr
}

const getActivePetLinks = async(petId) => {
  try{
    const result = await pool.query(sqlText.getActivePetLinksText,[petId])
    const activeLinksArray = result.rows.filter( row => row.active == true)
    return activeLinksArray
  }catch(e){
    console.log('Error trying to get active pet links,line 236, error: ',e)
  }
  
}

const getInvitedOwnerIdFromInvite = async (inviteToken) => {
  const result = await pool.query(sqlText.getInvitedOwnerIdFromInviteText, [inviteToken])
  const recipientOwnerId = result.rows[0].receiver_owner_id
  return recipientOwnerId 
}

// ACTIVITY QUERIES
// Recent activity (7 days)
// const getActivity = async(petId,targetDate) => {
//   // Get all active links to pets from ownerID and return pet IDs.
//   // const petIdsArray = await getOwnersPetIds(ownerId)
//   // Get activity for each petID on the target date, and 7 days before and 7 days aftercarballidoj92@gmail.com
//   const timestampParser = (timestampNumber) => {
//     const convertedDate = new Date(timestampNumber)
//     const fullYear = convertedDate.getFullYear()
//     const month = convertedDate.getMonth()
//     const date = convertedDate.getDate()
//     return { fullYear,month,date }
//   }
//   const { fullYear,month,date } = timestampParser(targetDate)
//   const daysBeforeAndAfter = 7
//   const dateArray = []
//   for(let i = daysBeforeAndAfter * -1 ; i < daysBeforeAndAfter + 1; i++){
//     // Convert targetDate to Date Object
//     const referenceDate = new Date(targetDate)
//     // Set the new date; Returns Type: NUMBER
//     let newDate = referenceDate.setDate(referenceDate.getDate() + i)
//     dateArray.push(newDate)
//   }
//   // console.log(sqlText.getActivityText(3))
//   const result = await pool.query(sqlText.getActivityText(), [ petId, `${fullYear}-${month+1}-${date}`,`${daysBeforeAndAfter} days`])
//   // console.log('Queries console.log: ',util.inspect(result, { depth: null }));

//   // Result.rows returns an array of objects, holding a key-value pair of the column name and its corresponding value.
//   const data = result.rows
//   // Need to loop through the data, filter by date, and then group the activity based on the date.
//   // Then, return this data in the following format: [{date1(timestamp number):[ {activity1,...},{activity2,...}]},{date2(timestamp number):[ {activity1,...},{activity2,...}]},... ]
//   const formattedData = dateArray.map( dateAsTimestamp => {
//     const { fullYear, month, date } = timestampParser(dateAsTimestamp)
//     const filteredActivityArray = data.filter( activity => { 
//       const activityDate = new Date(activity.set_on_at)
//       return (
//         fullYear == activityDate.getFullYear() &&
//         month == activityDate.getMonth() &&
//         date == activityDate.getDate()
//       )
//     })
//     return { [`${fullYear}-${month + 1}-${date}`]:filteredActivityArray }
//   })

//   return formattedData  
// }

const getActivity = async(petId,targetDate, timeWindow) => {

  const { daysBefore, daysAfter } = timeWindow
  // console.log('TargetDate: ', targetDate)
  const { year,monthIndex,date } = parse(targetDate)
  // console.log('${year}-${monthIndex+1}-${date}: ', `${year}-${monthIndex+1}-${date}`)
  const dateArray = []
  for(let i = (daysBefore*-1) ; i <= daysAfter ; i++){
    const referenceDate = new Date(targetDate)
    let newDate = referenceDate.setDate(referenceDate.getDate() + i)
    dateArray.push(newDate)
  }
  const result = await pool.query(sqlText.getActivityText(), [ petId, `${year}-${monthIndex+1}-${date}`,`${daysBefore} days`, `${daysAfter} days`])

  
  const data = result.rows
  // console.log('Line 342, data: ', data)
  const formattedData = dateArray.map( dateAsTimestamp => {
    const { year, monthIndex, date } = parse(dateAsTimestamp)
    console.log('Line 347 parsed timestamp: ', year,monthIndex, date)
    const filteredActivityArray = data.filter( activity => { 
      const activityDate = new Date(activity.set_on_at)
      return (
        year == activityDate.getFullYear() &&
        monthIndex == activityDate.getMonth() &&
        date == activityDate.getDate()
      )
    })
    return { [`${year}-${monthIndex + 1}-${date}`]:filteredActivityArray }
  })
  // console.log('Line 357, formattedData: ', formattedData)

  return formattedData  
}

const getPetActivityByOwner = async(ownerData) => {
  // Extract owner email
  const email = ownerData.email
  // const dateToday = ownerData.dateToday
  // Example referenceDate format: 'YYYY-MM-DD'
  const referenceDate = ownerData.referenceDate
  // Assign number of days before and after referenced date
  const daysBeforeAndAfter = 7
  // Get owner ID
  const ownerId = await getOwnerId(email)
  // Query 'pet_owners' table to identify all active pet links
  const ownerPetIdsArray = await getOwnersPetIds(ownerId)
  // Using the array returned above, query the activity table for all activity of all pets in the last 7 days
  const recentActivity = await getActivity(ownerPetIdsArray,referenceDate,daysBeforeAndAfter)
  return recentActivity

}

// const compareSavedInvitatonToken = async(invitationToken,sendingOwnerId) => {
//   console.log('Queries.mjs line 142, sendingOwnerId:', sendingOwnerId, 'invitationToken: ', invitationToken)
//   const result = await pool.query(sqlText.getInvitationTokenComparisonText(), [sendingOwnerId,invitationToken])
//   console.log('Queries.mjs line 144, result:',result)
//   return result.rows.length
// }

// const getLastAccessedTimestamp = async (invitationToken) => {
//   const result = await pool.query(sqlText.getLastAccessedTimestampText(),[invitationToken])
//   if(!result.rows[0].accessed_at) return true
//   else return false
// }
//setInvitationAccessedAtTimestamp
const setInvitationAccessedAtTimestamp = async(invitationToken) => {
  // const currTimestampUTC = new Date().toUTCString()
  // console.log('Current timestamp: ', currTimestampUTC)
  const result = await pool.query(sqlText.setInvitationAccessedAtTimestampText(),[ invitationToken ])
  //console.log('Queries, line 158: ', result)
  return result.rowCount
}

const setResetAccessedAtTimestamp = async(resetToken) => {
  try{
    // const currTimestampUTC = new Date().toUTCString()
    // console.log('Current timestamp: ', currTimestampUTC)
    const result = await pool.query(sqlText.setResetAccessedAtTimestampText,[ resetToken ])
    //console.log('Queries, line 158: ', result)
    return result.rows[0].accessed_at
  }catch(e){
    return e
  }
  
}

const setNewRefreshToken = async(newRefreshToken,ownerId) => {
  try{
    const result = await pool.query(sqlText.setNewRefreshTokenText, [ newRefreshToken,ownerId ])
    return result.rowCount
  }catch(e){
    return null
  }
}

const getLastAccessedTimestamp = async (invitationToken) => {
  const result = await pool.query(sqlText.getLastAccessedTimestampText(),[invitationToken])
  if(!result.rows[0].accessed_at) return true
  else return false
}

//
const addOwner = async(ownerData) => {
  try{
    const { email, passwordHash, refreshToken, username } = ownerData
    // Single query
    const result = await pool.query(sqlText.insertIntoText('owners'),[email,passwordHash,refreshToken, username])
    const ownerId = result.rows[0].owner_id
    const ownerUsername = result.rows[0].username
    return { ownerId, ownerUsername }
  }catch(e){
    console.log('Line 300, Queries.mjs, addOwner Error:', e)
    return null
  }
  
}
const addReceivingOwnerIdToInvitation = async(ownerId,invitationToken) => {
  const result = await pool.query(sqlText.updateInvitationToken,[ownerId,invitationToken])
  return result
}

const checkExistingCredentials = async(username,email) => {
  const ownerIdFromUsername = await getOwnerId('username',username)
  console.log('ownerIdFromUsername: ', ownerIdFromUsername)
  const ownerIdFromEmail = await getOwnerId('email',email)
  console.log('ownerIdFromEmail: ',ownerIdFromEmail)
  if(ownerIdFromUsername == null && ownerIdFromEmail == null ){
    console.log('Both username and email are available')
    return false
  }
  console.log('Either username or email are already existing')
  return true
}

const checkOwnerLink = async(ownerId,petId) => {
  try{
    console.log(petId)
    console.log('petId received in line 410 of queires.js: ', parseInt(petId))
    const result = await pool.query(sqlText.checkOwnerLinkText,[ownerId])
    console.log('Result from checking owner link: ',result)
    const petIdArray = result.rows.map( row => row.pet_id) 
    console.log('petIdArray result: ', petIdArray)
    console.log(petIdArray)
    // const convertToNumber = Number(petId)
    return petIdArray.includes(parseInt(petId))
  }catch(e){
    return e
  }
}

export default {
  addPet,
  addInvitationLink,
  addPetOwnerLink,
  addActivity,
  getPasswordHash,
  getOwnerId,
  getRefreshToken,
  getResetToken,
  getEmail,
  getPetId,
  getInvitedOwnerIdFromInvite,
  getOwnersPetIds,
  getActivePetLinks,
  getActivity,
  getPetActivityByOwner,
  getLastAccessedTimestamp,
  getInvitationId,
  getOwnerIdFromEmail,
  getSingleActivePetId,
  deactivatePetOwnerLink,
  updateOwner,
  updatePet,
  updateActivity,
  setInvitationAccessedAtTimestamp,
  setResetAccessedAtTimestamp,
  setNewRefreshToken,
  addOwner,
  addReceivingOwnerIdToInvitation,
  checkExistingCredentials,
  checkOwnerLink
}

