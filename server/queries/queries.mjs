import pg from 'pg'
import sqlText from './sqlText.mjs'
//mport dotenv from 'dotenv/config'

const { Pool } = pg

const pool = new Pool()

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

const getPasswordHash = async(ownerId) => {
  const result = await pool.query(sqlText.getHashedPasswordText,[ownerId])
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
const getOwnerId = async(email) => {
  //const email = ownerData.email
  //console.log('Line 62 Queries',email)
  try{
    const result = await pool.query(sqlText.getOwnerText(),[email])
    //console.log('Here\'s the SQL text: ',sqlText.getOwnerText())
    //console.log(result)
    const ownerId = result.rows[0].owner_id
    // console.log(ownerId)
    return ownerId
  }catch(e){
    return null
  }
}

const getPetId = async(petName,dob,sex) => {
  try{
    const result = await pool.query(sqlText.getPetIdText, [petName,dob,sex] )
    //console.log('Here\'s the SQL text: ',sqlText.getOwnerText())
    //console.log(result)
    const petId = result.rows[0].pet_id
    // console.log(ownerId)
    return petId
  }catch(e){
    return e
  }
}

const getInvitationId = async(invitationToken) => {
  const result = await query.pool(sqlText.getInvitationTokenText, [ invitationToken ])
}
 
// 'Update' operations
const updateOwner = async(updatedData) => {
  const email = updatedData.email
  const [ ...fields ] = updatedData.fields
  console.log('Fields => ',fields)
  const [ ...newValues ] = updatedData.newValues
  console.log('newValues => ',newValues)

  // Two queries:
  // 1. Get ownerId
  const resultOwner = await pool.query(sqlText.getOwnerText(),[email])
  const ownerId = resultOwner.rows[0].owner_id
  console.log('ownerId =>', ownerId)
  //2. Pass in owner ID that needs updating
  console.log("Sql Text =>", sqlText.updateText('owners',fields,'owner_id'))
  const result = await pool.query(sqlText.updateText('owners',fields,'owner_id'),[...newValues,ownerId])
  console.log(result)
  return result
}

const updatePet = async(updatedData) => {
  const petId = updatedData.petId
  // const email = updatedData.email
  const [ ...fields ] = updatedData.fields
  // console.log('Fields => ',fields)
  const [ ...newValues ] = updatedData.newValues
  //console.log('newValues => ',newValues)

  // Two queries:
  // 1. Get petId
  //const resultOwner = await pool.query(sqlText.getOwnerText(),[email])
  //const ownerId = resultOwner.rows[0].owner_id
  //console.log('ownerId =>', ownerId)
  //2. Pass in owner ID that needs updating
  //console.log("Sql Text =>", sqlText.updateText('owners',fields,'owner_id'))
  const result = await pool.query(sqlText.updateText('pets',fields,'pet_id'),[...newValues,petId])
  // console.log(result)
  return result
}

// 'Remove' operations
const deactivatePetOwnerLink = async( ownerId,petId ) => {
  const result = await pool.query(sqlText.deactivatePetOwnerLinkText([ownerId,petId]))
  return result
}

const getOwnersPetIds = async(ownerId) => {
  // console.log(ownerId)
  const result = await pool.query(sqlText.getOwnersPetIdsText(), [ownerId])
  // console.log('Here\'s the SQL text: ',sqlText.getOwnersPetIdsText())
  // console.log('Result from fetching owners pet ids: ',result)
  const petIdsArr = result.rows.map(row => row.pet_id)
  const filteredPetIdsArray = petIdsArr.filter( petId => !petId)
  return filteredPetIdsArray
}

const getActivePetLinks = async(petId) => {
  const result = await pool.query(sqlText.getPetLinks,[petId])
  const activeLinksArray = result.rows.filter( row => row.active == true)
  return activeLinksArray
}

const getInvitedOwnerIdFromInvite = async (inviteToken) => {
  const result = await pool.query(sqlText.getInvitedOwnerIdFromInviteText, [inviteToken])
  const recipientOwnerId = result.rows[0].receiver_owner_id
  return recipientOwnerId 
}

// ACTIVITY QUERIES
// Recent activity (7 days)
const getActivity = async(ownerPetIdsArray,referenceDate,daysBeforeAndAfter) => {
  const activityArray = ownerPetIdsArray.map( async(petId) => {
    // Example referenceDate format: 'YYYY-MM-DD'
    const result = await pool.query(sqlText.getActivityText(), [ petId, referenceDate, daysBeforeAndAfter ])
    return result.rows
  })
  return activityArray
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

const getLastAccessedTimestamp = async (invitationToken) => {
  const result = await pool.query(sqlText.getLastAccessedTimestampText(),[invitationToken])
  if(!result.rows[0].accessed_at) return true
  else return false
}

const addOwner = async(ownerData) => {
  const { email, passwordHash, refreshToken } = ownerData
  // Single query
  const result = await pool.query(sqlText.insertIntoText('owners'),[email,passwordHash,refreshToken])
  const ownerId = result.rows[0].owner_id
  return ownerId
}
const addReceivingOwnerIdToInvitation = async(ownerId,invitationToken) => {
  const result = await pool.query(sqlText.updateInvitationToken,[ownerId,invitationToken])
  return result
}

export default {
  addPet,
  addInvitationLink,
  addPetOwnerLink,
  getPasswordHash,
  getOwnerId,
  getPetId,
  getInvitedOwnerIdFromInvite,
  getOwnersPetIds,
  getActivePetLinks,
  getActivity,
  getPetActivityByOwner,
  getLastAccessedTimestamp,
  getInvitationId,
  deactivatePetOwnerLink,
  updateOwner,
  updatePet,
  setInvitationAccessedAtTimestamp,
  addOwner,
  addReceivingOwnerIdToInvitation
}

