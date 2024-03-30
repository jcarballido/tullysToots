const activityColumns = ['pet_id','entered_by','set_on_at','pee','poo']

const insertIntoText = (tableName,newValuesArr) => {
  // const activityColumns = ['pet_id','entered_by','meridiem','set_on_at','pee','poo']
  const ownersColumns = ['email','password_hash','refresh_token','username']
  const petsColumns = ['pet_name','dob','sex']
  const petOwnersColumns = [ 'owner_id', 'pet_id','active']
  const resetTokensColumns = ['reset_token','owner_id','accessed_at']
  const invitationsColumns = ['sender_owner_id','receiver_owner_id','invitation_token']
 
  const singleEntryText = (columnsArr) => {
    return `INSERT INTO ${tableName} (${columnsArr.join()})
    VALUES (${columnsArr.map( (_,index) => {return `$${index+1}`}).join()})
    RETURNING *
    `
  }
  // const multipleEntryText = (columnsArr,newValuesArr) => {
  //     const valuesTextArray = newValuesArr.map( (val,index) => return `($1,$${index+3},$2)`)
  //     return `INSERT INTO ${tableName} (${columnsArr.join()})
  //     VALUES ${valuesTextArray.join()}
  //     RETURNING *
  //     `
  //   }

  const multiplePetOwnersEntryText = (columnsArr) => {
      const valuesTextArray = newValuesArr.map( (_,index) => {return `($1,$${index+3},$2)`})
      return `getActivity
      INSERT INTO ${tableName} (${columnsArr.join()}) 
      VALUES ${valuesTextArray.join()} 
      RETURNING *`
  }

  switch(tableName){
    case 'activities':
      return singleEntryText(activityColumns)
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

  const camelCaseToSnakeCase = ( camelCase ) => {
    // ex: threeWordExample to three_word_example
    // Separate the string where a lower case letter meets an uppercase letter and then replace it with an underscore '_' and covnert the uppercase letters to lowercase
    const capitalLetterLookahead = /(?=[A-Z])/
    const splitString = camelCase.split(capitalLetterLookahead)
    const snakeCaseString = splitString.join('_').toLowerCase()
    console.log('Snake case string => ', snakeCaseString)
    return snakeCaseString
  }

  const fieldsArrayConvertedToSnakeCase = fieldsArr.map(field => { return camelCaseToSnakeCase(field) })
  console.log("feildsArrayConvertedToSnake =>",fieldsArrayConvertedToSnakeCase)
  const identifierConvertedToSnakeCase = camelCaseToSnakeCase(identifier)

  return(
    `UPDATE ${tableName}
    SET ${fieldsArrayConvertedToSnakeCase.map( (field,index) => {return `${field}=$${index+1}`})} 
    WHERE ${identifierConvertedToSnakeCase}=$${fieldsArr.length + 1}
    RETURNING *
    `
  )
}

const deactivatePetOwnerLinkText = () => {
  return `
    UPDATE pet_owners
    SET active=false
    WHERE owner_id = $1 AND pet_id = $2
  `
}

// Get Commands
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
    SELECT activity_id,${activityColumns.join()}
    FROM activities
    WHERE pet_id = $1 AND set_on_at > $2::timestamp - $3::interval AND set_on_at < $2::timestamp + $4::interval
  `
}

const getSingleDayActivityText = () => {
  // referenceDate example: 'YYYY-MM-DD HH24:MM'
  return `
    SELECT activity_id,${activityColumns.join()}
    FROM activities
    WHERE pet_id = $1 AND set_on_at >= $2::timestamp AND set_on_at < $2::timestamp + '1 day'::interval
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
  SELECT owner_idgetActivity
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
// const getInvitationTokenText

const setInvitationAccessedAtTimestampText = () => {
  return `
    UPDATE invitations 
    SET accessed_at = now() AT TIME ZONE 'UTC'
    WHERE invitation_token = $1  
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

export default {
  insertIntoText,
  updateText,
  deactivatePetOwnerLinkText,
  getActivityText,
  getSingleDayActivityText,
  getOwnerText,
  getEmail,
  getActivePetLinksText,
  getPetIdText,
  getOwnersPetIdsText,
  getInvitationTokenComparisonText,
  getLastAccessedTimestampText,
  getInvitedOwnerIdFromInviteText,
  getPasswordHashText,
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
  checkOwnerLinkText
}

// const getActivity = (dateToday,dateReference,pastDatesToCapture) => {
//   // 'entered_by','meridiem','set_on_at','pee','poo'

//   return `
//   SELECT entered_by, meridiem, TO_CHAR(set_on_at, 'DD/MM/YYY HH:MM'),pee,pee
//   FROM activity
//   WHERE pet_id = $1 AND TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) > TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) - INTERVAL '${pastDatesToCapture} D'
//   `
// }