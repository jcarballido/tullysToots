const activityColumns = ['pet_id','entered_by','meridiem','set_on_at','pee','poo']

const insertIntoText = (tableName) => {
  // const activityColumns = ['pet_id','entered_by','meridiem','set_on_at','pee','poo']
  const ownersColumns = ['email','password_hash','refresh_token']
  const petsColumns = ['pet_name']
  const petOwnersColumns = [ 'owner_id', 'pet_id','active']
  const resetTokensColumns = ['reset_token','owner_id','accessed_at']
  const invitationsColumns = ['sender_owner_id','receiver_owner_id','invitation_token']
 
  const text = (columnsArr) => {
    return `INSERT INTO ${tableName} (${columnsArr.join()})
    VALUES (${columnsArr.map( (_,index) => {return `$${index+1}`}).join()})
    RETURNING *
    `
  }

  switch(tableName){
    case 'activities':
      return text(activityColumns)
    case 'owners':
      return text(ownersColumns)
    case 'pets':
      return text(petsColumns)
    case 'pet_owners':
      return text(petOwnersColumns)
    case 'reset_tokens':
      return text(resetTokensColumns)
    case 'invitations':
      return text(invitationsColumns)
  }

}

const updateText = (tableName, fieldsArr, identifier) => {

  const camelCaseToSnakeCase = ( camelCase ) => {
    // ex: threeWordExample to three_word_example
    // Separate the string where a lower case letter meets an uppercase letter and then replace it with an underscore '_' and covnert the uppercase letters to lowercase
    const capitalLetterLookahead = /(?=[A-Z])/
    const splitString = camelCase.split(capitalLetterLookahead)
    const snakeCaseString = splitString.join('_').toLowerCase()
    console.log('SNake case string => ', snakeCaseString)
    return snakeCaseString
  }

  const fieldsArrayConvertedToSnakeCase = fieldsArr.map(field => { return camelCaseToSnakeCase(field) })
  console.log("feildsArrayConvertedToSnake =>",fieldsArrayConvertedToSnakeCase)

  return(
    `UPDATE ${tableName}
    SET ${fieldsArrayConvertedToSnakeCase.map( (field,index) => {return `${field}=$${index+1}`})} 
    WHERE ${identifier}=$${fieldsArr.length + 1}
    `
  )
}

const deactivatePetOwnerLinkText = (identifiersArr) => {
  return `
    UPDATE pet_owners
    SET active=false
    WHERE ${identifiersArr.map((id,index) => {return `${id}=${index+1}`}).join(' AND ')}
  `
}

// Get Commands
const getActivityText = () => {
  // referenceDate example: 'YYYY-MM-DD HH24:MM'
  return`
    SELECT ${activityColumns.join()}
    FROM activities
    WHERE pet_id = $1 AND set_on_at > $2::timestamp - INTERVAL '$3 days' AND set_on_at < $2::timestamp + INTERVAL '$3 days'
  `
}

const getOwnerText = () => {
  return`
    SELECT owner_id
    FROM owners
    WHERE email = $1
  `
}

const getOwnersPetIdsText = () => {
  return `
  SELECT pet_id FROM pet_owners
  WHERE owner_id = $1
  `
}

const getInvitationTokenComparisonText = () => {
  return `
    SELECT invitation_token
    FROM invitations
    WHERE sender_owner_id = $1 AND invitation_token = $2
  `
}

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

const setInvitationAccessedAtTimestampText = () => {
  return `
    UPDATE invitations 
    SET accessed_at = now() AT TIME ZONE 'UTC'
    WHERE sender_owner_id = $1 AND invitation_token = $2  
  `
}

export default {
  insertIntoText,
  updateText,
  deactivatePetOwnerLinkText,
  getActivityText,
  getOwnerText,
  getOwnersPetIdsText,
  getInvitationTokenComparisonText,
  getLastAccessedTimestampText,
  getInvitedOwnerIdFromInviteText,
  getPasswordHashText,
  setInvitationAccessedAtTimestampText
}

// const getActivity = (dateToday,dateReference,pastDatesToCapture) => {
//   // 'entered_by','meridiem','set_on_at','pee','poo'

//   return `
//   SELECT entered_by, meridiem, TO_CHAR(set_on_at, 'DD/MM/YYY HH:MM'),pee,pee
//   FROM activity
//   WHERE pet_id = $1 AND TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) > TO_TIMESTAMP(${dateNow},DD/MM/YYYY HH24:MI) - INTERVAL '${pastDatesToCapture} D'
//   `
// }