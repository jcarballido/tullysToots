// import UpdateUsername from "../../client/src/components/UpdateUsername"

const activityColumns = ['pet_id','set_by','set_on_at','pee','poo','timezone_offset_hours','reference_date']

const insertIntoText = (tableName,newValuesArr) => {
  // const activityColumns = ['pet_id','entered_by','meridiem','set_on_at','pee','poo']
  const ownersColumns = ['email','password_hash','refresh_token','username']
  const petsColumns = ['pet_name','dob','sex']
  const petOwnersColumns = [ 'owner_id', 'pet_id','active']
  const resetTokensColumns = ['reset_token','owner_id','accessed_at']
  const invitationsColumns = ['sender_owner_id','receiver_owner_id','invitation_token']
 
  const singleEntryText = (columnsArr) => {
    // console.log('*sqlText* attempt to insert data to table')
    return `INSERT INTO ${tableName} (${columnsArr.join()})
    VALUES (${columnsArr.map( (_,index) => {return `$${index+1}`}).join()})
    RETURNING *
    `
  }

  const insertCommandActivity = (columnsArr) => {
    // console.log('*sqlText* attempt to insert data to table')
    return `
      WITH inserted_row AS (INSERT INTO ${tableName} (${columnsArr.join()})
      VALUES (${columnsArr.map( (_,index) => {return `$${index+1}`}).join()})
      RETURNING *
      )
      SELECT 
        inserted_row.*,
        owners.username
      FROM
        inserted_row
      JOIN
        owners ON inserted_row.set_by = owners.owner_id
  `}
  // const multipleEntryText = (columnsArr,newValuesArr) => {
  //     const valuesTextArray = newValuesArr.map( (val,index) => return `($1,$${index+3},$2)`)
  //     return `INSERT INTO ${tableName} (${columnsArr.join()})
  //     VALUES ${valuesTextArray.join()}
  //     RETURNING *
  //     `
  //   }

  const multiplePetOwnersEntryText = (columnsArr) => {
      const valuesTextArray = newValuesArr.map( (_,index) => {return `($1,$${index+3},$2)`})
      return `
      INSERT INTO ${tableName} (${columnsArr.join()}) 
      VALUES ${valuesTextArray.join()} 
      RETURNING *`
  }

  switch(tableName){
    case 'activities':
      return insertCommandActivity(activityColumns)
    case 'owners':
      return singleEntryText(ownersColumns)
    case 'pets':
      return singleEntryText(petsColumns)
    case 'pet_owners':
      return multiplePetOwnersEntryText(petOwnersColumns)
    case 'reset_tokens':
      return singleEntryText(resetTokensColumns)
    case 'invitations':
      return singleEntryText(invitationsColumns)
  }

}



const updateText = (tableName, fieldsArr, identifier) => {

  /* UPDATE activities
           
  */

  // const camelCaseToSnakeCase = ( camelCase ) => {
  //   // ex: threeWordExample to three_word_example
  //   // Separate the string where a lower case letter meets an uppercase letter and then replace it with an underscore '_' and covnert the uppercase letters to lowercase
  //   const capitalLetterLookahead = /(?=[A-Z])/
  //   const splitString = camelCase.split(capitalLetterLookahead)
  //   const snakeCaseString = splitString.join('_').toLowerCase()
  //   console.log('Snake case string => ', snakeCaseString)
  //   return snakeCaseString
  // }

  // const fieldsArrayConvertedToSnakeCase = fieldsArr.map(field => { return camelCaseToSnakeCase(field) })
  // // console.log("fieldsArrayConvertedToSnake =>",fieldsArrayConvertedToSnakeCase)
  // const identifierConvertedToSnakeCase = camelCaseToSnakeCase(identifier)

  return(
    `UPDATE ${tableName}
    SET ${fieldsArr.map( (field,index) => {return `${field}=$${index+1}`})} 
    WHERE ${identifier}=$${fieldsArr.length + 1}
    RETURNING *
    `
  )
}

const updateOwner = `
  UPDATE owners
  SET refresh_token=$1
  WHERE owner_id=$2
`

const updatePassword = `
  UPDATE owners
  SET password_hash = $1
  WHERE owner_id = $2
`

const updateUsername = `
  UPDATE owners
  SET username = $2
  WHERE owner_id = $1
`


const deactivatePetOwnerLinkText = () => { 
  return `
    UPDATE pet_owners
    SET active=false
    WHERE owner_id = $1 AND pet_id = $2
  `
}

//     Commands
// const getActivityText = (numDays) => {
//   // referenceDate example: 'YYYY-MM-DD HH24:MM'
//   return `
//     SELECT ${activityColumns.join()}
//     FROM activities
//     WHERE pet_id = $1 AND set_on_at > $2::timestamp - $3::interval AND set_on_at < $2::timestamp + $3::interval
//   `
// }

const getOwnerText = (identifierString) => {
  return`
    SELECT owner_id
    FROM owners
    WHERE ${identifierString} = $1
  `
}

//SQL
const getActivityText = () => {
  // referenceDate example: 'YYYY-MM-DD HH24:MM'
  return `
    SELECT activities.*,owners.username
    FROM activities
    JOIN owners ON activities.set_by = owners.owner_id
    WHERE activities.pet_id = $1 AND activities.reference_date > $2::timestamp - $3::interval AND activities.reference_date < $2::timestamp + $4::interval
  `
}

const getSingleDayActivityText = () => {
  // referenceDate example: 'YYYY-MM-DD HH24:MM'
  return `
    SELECT activities.*,owners.username
    FROM activities
    JOIN owners ON activities.set_by = owners.owner_id
    WHERE activities.pet_id = $1 AND activities.reference_date >= $2::timestamp AND activities.reference_date < $2::timestamp + '1 day'::interval
  `
}

const getEmail = `
  SELECT email 
  FROM owners
  WHERE emal = $1
`
const getActivePetLinksText = `
  SELECT *
  FROM pet_owners
  WHERE pet_id = $1
`

const getPetIdText = `
  SELECT pet_id
  FROM pets
  WHERE pet_name = $1 AND dob = $2 AND sex = $3;
`

const getPets = `
  SELECT pets.*
  FROM pets
  INNER JOIN pet_owners ON pet_owners.pet_id = pets.pet_id
  WHERE pet_owners.owner_id = $1 AND pet_owners.active = true
`

// const getOwnersPetIdsText = () => {
//   return `
//   SELECT pet_id FROM pet_owners
//   WHERE owner_id = $1 AND active = true
//   `
// }

const getOwnersPetIdsText = () => {
  return `
    SELECT pets.pet_name,pet_owners.pet_id 
    FROM pet_owners 
    INNER JOIN pets ON pets.pet_id = pet_owners.pet_id 
    WHERE pet_owners.owner_id = $1 AND pet_owners.active = true
  `
}

const getInvitationTokenComparisonText = () => {
  return `
    SELECT invitation_token
    FROM invitations
    WHERE sender_owner_id = $1 AND invitation_token = $2
  `
}

const getOwnerIdFromEmailText = `
  SELECT owner_id
  FROM owners
  WHERE email = $1
`
const getResetTokenText = `
  SELECT reset_token
  FROM reset_tokens
  WHERE reset_token = $1
`

const getSingleActivePetId = `
  SELECT pet_id
  FROM pet_owners
  WHERE owner_id = $1 AND active = true
  LIMIT 1
`
const getRefreshTokenFromOwnerIdText = `
  SELECT refresh_token
  FROM owners
  WHERE owner_id = $1
`
const getRefreshTokenFromUsernameText = `
  SELECT refresh_token
  FROM owners
  WHERE username = $1
`

const getLastAccessedTimestampText = () => {
  return `
    SELECT accessed_at
    FROM invitations
    WHERE invitation_token = $1
  `
}

const getInvitedOwnerIdFromInviteText = `
  SELECT receiver_owner_id
  FROM invitations
  WHERE invitation_token = $1
`
const getPasswordHashText = `
  SELECT password_hash
  FROM owners
  WHERE owner_id = $1
`
const getUsernameText = `
  SELECT username
  FROM owners
  WHERE owner_id = $1
`

const getInvitationTokenText = `
  SELECT invitations
  FROM owners
  WHERE owner_id = $1
`

const getInvitationToken = `
  SELECT invitation_token
  FROM invitations
  WHERE invitation_id = $1
`

const setInvitationAccessedAtTimestampText = () => {
  return `
    UPDATE invitations 
    SET accessed_at = now() AT TIME ZONE 'UTC'
    WHERE invitation_token = $1  
    RETURNING *
  `
}
const setResetAccessedAtTimestampText = `
  UPDATE reset_tokens 
  SET accessed_at = now() AT TIME ZONE 'UTC'
  WHERE reset_token = $1 
  RETURNING *
`
const setNewRefreshTokenText = `
  UPDATE owners
  SET refresh_token = $1
  WHERE owner_id = $2
  RETURNING *
`

const updateInvitationToken = `
    UPDATE invitations
    SET receiving_owner_id = $1
    WHERE invitation_token = $2
`

const checkOwnerLinkText = `
  SELECT pet_id
  FROM pet_owners
  WHERE owner_id = $1 AND active = true
`
const deleteActivityByIdText = `
  DELETE FROM activities
  WHERE activity_id = $1
`

const addInvitationToken = `
  INSERT INTO invitations (from_owner_id, recipient_email, invitation_token)
  VALUES ($1, $2,$3)
`

const storeInvitationTokenText = `
  UPDATE owners
  SET invitations = array_append(invitations, $1)
  WHERE owner_id = $2;
`

const addAccessedTimestampText = `
  UPDATE invitations
  SET accessed_at = NOW()
  WHERE invitation_token = $1
  RETURNING *
`

const getAccessedTimestampText = `
  SELECT accessed_at 
  FROM invitations
  WHERE invitation_token = $1
`
const checkValidity = `
  SELECT accessed_at
  FROM invitations
  WHERE invitation_token = $1
`
const setInvalidInvitationToken = `
  UPDATE invitations
  SET accepted = false,
      rejected = false,
      pending = false,
      expired = true
  WHERE invitation_token = $1
`
const logoutUser = `
  UPDATE owners
  SET refresh_token = null
  WHERE owner_id = $1
`

const addOwnerText = `
  INSERT INTO owners(email,password_hash,username)
  VALUES($1,$2,$3)
  RETURNING *
`

const removeInvitationToken = `
  WITH invitation_id_to_remove AS (
    SELECT invitation_id
    FROM invitations
    WHERE invitation_token = $1  
  )
  UPDATE owners
  SET invitations = array_remove(invitations, (SELECT invitation_id FROM invitation_id_to_remove)::VARCHAR )
  WHERE owner_id = $2
`
/*`
  UPDATE owners
  SET invitations = array_remove(invitations, $1)
  WHERE owner_id = $2
`
*/

const getPetInfo = `
  SELECT * 
  FROM pets
  WHERE pet_id = $1
`

const checkInvitePending = `
  SELECT pending
  FROM invitations
  WHERE invitation_id = $1
`

const checkExistingLink = `
  SELECT *
  FROM pet_owners
  WHERE pet_id = $1 AND owner_id = $2 AND active=true
`

const updateLinkStatus = `
  UPDATE pet_owners
  SET active=true
  WHERE pet_id = $1 AND owner_id = $2
`

// const getInvitationIdsText = `
//   SELECT invitation_token
//   FROM invitations
//   WHERE invitation_id = $1
// ` 

const setInviteTokenAcceptedText = `
  UPDATE invitations
  SET expired = false, pending = false, accepted = true, rejected=false
  WHERE invitation_id = $1
`

const addPetOwnerText = `
  INSERT INTO pet_owners(pet_id,owner_id,active)
  VALUES($1,$2, true)
` 

const rejectInvitation = `
  UPDATE invitations
  SET rejected=true
  WHERE invitation_id=$1
`

const getInvitationIdsText =  `
  SELECT invitation_id 
  FROM invitations
  WHERE invitation_token = $1
`

const getInvitationTokens = `
  SELECT i.invitation_token 
  FROM 
    owners o, 
    UNNEST(o.invitations) AS key_array_element
  INNER JOIN invitations i
  ON
    key_array_element::INT = i.invitation_id
  WHERE o.owner_id = $1
`

const getInvitationIdText = `
  SELECT invitation_id
  FROM invitations 
  WHERE invitation_token = $1 
`

const checkInviteLink = `
  SELECT *
  FROM owners
  WHERE 
    $1 = ANY (invitations)
    AND owner_id = $2
`

const setInviteExpiredByToken = `
  UPDATE invitations
  SET expired = true
  WHERE invitation_token = $1
`
const getTokenData = `
    SELECT * 
    FROM invitations
    WHERE invitation_token = $1 
`

const getPendingInvitationTokens = `
  SELECT i.invitation_token, i.invitation_id
  FROM 
    owners o, 
    UNNEST(o.invitations) AS key_array_element
  INNER JOIN invitations i
  ON
    key_array_element::INT = i.invitation_id
  WHERE o.owner_id = $1 AND i.pending = true
`

const confirmLinkedAndPendingInvitation = `
  SELECT i.invitation_token 
  FROM 
    owners o, 
    UNNEST(o.invitations) AS key_array_element
  INNER JOIN invitations i
  ON
    key_array_element::INT = i.invitation_id
  WHERE o.owner_id = $2 AND i.pending = true AND i.invitation_id = $1`

const getValidResetToken = `
  SELECT *
  FROM reset_tokens
  WHERE reset_token = $1 AND pending = TRUE
`

const setResetTokenExpired = `
  UPDATE reset_tokens
  SET expired = true
  WHERE reset_token = $1
`

// Get owner's registered email from owners table from passed in email.
// Pass owner's registered email to reset token table

const addResetToken = `
  INSERT INTO reset_tokens (recipient_email, reset_token)
  SELECT email, $2
  FROM owners
  WHERE owner_id = $1
  RETURNING *
`
const addResetTokenTimestamp = `
  UPDATE reset_tokens
  SET accessed_at = now() AT TIME ZONE 'UTC'
  WHERE reset_token_id = $1
  `

const unlinkPetText = `
  UPDATE pet_owners
  SET active = false
  WHERE owner_id = $1 AND pet_id = $2
`


export default {
  insertIntoText,
  updateText,
  updatePassword,
  updateUsername,
  // updatePet,
  deactivatePetOwnerLinkText,
  getActivityText,
  getSingleDayActivityText,
  getOwnerText,
  getEmail,
  getActivePetLinksText,
  getPetIdText,
  getPets,
  getOwnersPetIdsText,
  getInvitationTokenComparisonText,
  getLastAccessedTimestampText,
  getInvitedOwnerIdFromInviteText,
  getPasswordHashText,
  getUsernameText,
  getInvitationTokenComparisonText,
  getRefreshTokenFromOwnerIdText,
  getRefreshTokenFromUsernameText,
  getOwnerIdFromEmailText,
  getResetTokenText,
  getSingleActivePetId,
  setInvitationAccessedAtTimestampText,
  setResetAccessedAtTimestampText,
  setNewRefreshTokenText,
  updateInvitationToken,
  checkOwnerLinkText,
  deleteActivityByIdText,
  addInvitationToken,
  storeInvitationTokenText,
  addAccessedTimestampText,
  getAccessedTimestampText,
  checkValidity, 
  setInvalidInvitationToken,
  logoutUser,
  updateOwner,
  addOwnerText,
  removeInvitationToken,
  getPetInfo,
  getInvitationTokenText,
  checkInvitePending,
  checkExistingLink,
  updateLinkStatus,
  getInvitationIdsText,
  setInviteTokenAcceptedText,
  addPetOwnerText,
  rejectInvitation,
  getInvitationIdText,
  getInvitationTokens,
  getInvitationToken,
  checkInviteLink,
  setInviteExpiredByToken,
  getTokenData,
  getPendingInvitationTokens,
  confirmLinkedAndPendingInvitation,
  getValidResetToken,
  setResetTokenExpired,
  addResetToken,
  addResetTokenTimestamp,
  unlinkPetText
}

// const getActivity = (dateToday,dateReference,pastDatesToCapture) => {
//   // 'entered_by','meridiem','set_on_at','pee','poo'

//   return `
//   SELECT entered_by, meridiem, TO_CHAR(set_on_at, 'DD/MM/YYY HH:MM'),pee,pee
//   FROM activity
//   WHERE pet_id = $1 AND TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) > TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) - INTERVAL '${pastDatesToCapture} D'
//   `
// }