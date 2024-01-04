import express from 'express'
import queries from '../queries/queries.mjs'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import verifyAccessToken from '../middleware/verifyAccessToken.mjs'
import verifyRefreshToken from '../middleware/verifyRefreshToken.mjs'
import postProcessing from '../middleware/postProcessing.mjs'
import cookieParser from 'cookie-parser'

const router = express.Router()

const companyEmail = `"Tully's Toots" <${process.env.APP_USERNAME}>`
const companyEmailPassword = process.env.APP_PASSWORD


const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.APP_USERNAME,
    pass: companyEmailPassword,
  },
});

router.use(cookieParser())

router.post('/sign-up', async(req,res) => {
  const refreshToken = req.cookies.jwt
  if(refreshToken) return res.send('User is currently logged in')
  // Extract email and password from req.body
  const { username, email, password } = req.body
  // Validate
  // Confirm email is unique
  const uniqueCredentials = await queries.checkExistingCredentials(username,email)
  // If userExists returns false...
  if(uniqueCredentials == true) return res.send('ERROR: Email or username already exists. Please sign in or request a password reset')
  
  // Hash raw password
  const saltRounds = 5
  bcrypt.hash(password, saltRounds, async(err,passwordHash) => {
    // Temp refresh token
    const refreshSecret = process.env.REFRESH_SECRET
    const tempRefreshToken = jwt.sign({temp:Date.now()},refreshSecret)
    //store user in DB
    const owner = await queries.addOwner({ email,passwordHash,refreshToken:`temp.${tempRefreshToken}`, username } )
    const ownerId = owner.ownerId
    if(owner == null || err) return res.send('Error saving new sign-up.')
    const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 14;
    // Create refresh token...
    const refreshToken = jwt.sign({ ownerId }, refreshSecret, { expiresIn:'14d' })
    const updateResult = await queries.updateOwner({ownerId, fields:['refreshToken'], newValues:[refreshToken]})
    console.log('Result from attempting to update owner\'s refresh token: ', updateResult)
    if(updateResult instanceof Error) return res.send('ERROR: Could not update new owner with refresh token during sign-up.')
    // Create access token 
    const accessSecret = process.env.ACCESS_SECRET
    const accessToken = jwt.sign({ ownerId }, accessSecret, { expiresIn:'15m' })
    res.cookie('jwt',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})
    const invitationToken = req.query.invitationToken
    if(invitationToken){
      // const receivingOwnerId = await queries.getOwnerId(email)
      try{
        const result = await query.addReceivingOwnerIdToInvitation(ownerId,invitationToken)
      }catch(e){
        console.log('Error updating invitation token with new receiving owner id')
      }
      // Send access and invitation token
      return res.json({accessToken,invitationToken,ownerId,username:owner.ownerUsername})
    }else{
      // Send access token
      return res.json({accessToken,ownerId,username:owner.ownerUsername})
    }
  })
})

router.post('/sign-in', async(req,res) => {
  const refreshToken = req.cookies.jwt
  if(refreshToken) return res.send('User is currently logged in')
  // Extract email and password from req.body 
  const { username, password } = req.body
  // Confirm user is registered; NEED TO CREATE UserQueries SERVICE\
  const ownerId = await queries.getOwnerId('username',username)
  if(!ownerId) return res.send('User does not exist')
  const passwordHash = await queries.getPasswordHash(ownerId)
  //const user = await queries.authorizeUser(email,password)
  // Check password
  const passwordMatch = await bcrypt.compare(password, passwordHash)
  console.log('Account Router Line 75:', passwordMatch)
  // If passwords match:
  if(passwordMatch === true){
    const accessSecret = process.env.ACCESS_SECRET
    const refreshSecret = process.env.REFRESH_SECRET
    // Create access token
    const accessToken = jwt.sign({ ownerId }, accessSecret, {expiresIn: '15m'})
    // Create refresh token 
    const refreshToken = jwt.sign({ ownerId }, refreshSecret, { expiresIn:'14d'})
    // Set refresh token cookie
    const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 14 // ms/s * s/min * min/hr * hrs/day * num. days
    res.cookie('jwt',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})
    const result = await queries.setNewRefreshToken(refreshToken,ownerId)
    if(!result) {
      console.log('Result from attempting to set new refresh token on sign-in')
      return res.send('ERROR: Could not update refresh token on sign-in')
    }
    const invitationToken = req.query.invitationToken
    if(invitationToken){
      //const result = await query.addReceivingOwnerIdToInvitation(ownerId)
      try{
        const result = await query.addReceivingOwnerIdToInvitation(ownerId)
        // Send access token and invitation token
        return res.json({accessToken,invitationToken})
      }catch(e){
        return res.send('ERROR: Could not add recipient to invitation token')
      }
    }else{
      // Send access token
      return res.json({accessToken})
    }
  }else{
    return res.send('ERROR: Wrong credentials')
  }
})

// Need to test with frontend
router.get('/resetRequest', async(req,res) => {
  // Expecting a registered email
  const ownerEmail = req.body.email
  // Check if email is saved.
  const ownerId = await queries.getOwnerIdFromEmail(ownerEmail)
  if(ownerId === null) {
    console.log('Email requesting password reset does not exist')
    return res.json({message:'Email with reset link sent to requesting customer if it exists in our records'})
  }
  // const ownerId = req.ownerId
  // // Get email associated with owner ID
  // const ownerEmail = await queries.getEmail(ownerId)
  // 1. Create a JWT where the payload is { userId: userID from query}, and the JWT is named 'resetToken', and an expiration of 10 minutes.
  const resetSecret = process.env.RESET_SECRET
  const resetToken = sign({ ownerId }, resetSecret,{ expiresIn:'10m' })
  // 2. Store the userId,resetToken, AccessedAt='null' in a new row in the 'ResetRequest' table. Override existing resetToken.
  // const result = queryServices.resetRequest(userId, resetToken).
  // 3. Create a link that contains this JWT in the URL.
  const resetLink = `http://localhost:3000/resetPassword?resetToken=${resetToken}`
  // 4. Send this link via an email to the user's registered email (confirmed in Line 25)
  const resetPasswordEmailTemplate = (link) => {
    return `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password Form</title>
    </head>
    <body>
        <h1>Password Reset Link</h1>
        <h3>This is a one-time link. It will expire after clicking it or 10 minutes from now.<h3>
        <h3>PLease contact our support team if you did not make this request.<h3>
        <a href=${link} target="_blank">Click here to reset password</a>
    </body>
  `}
  const info = await transporter.sendMail({
    from: `${ companyEmail }`, // sender address
    to: `${ ownerEmail }`, // list of receivers
    subject: "Tully's Toots Password Reset", // Subject line
    html: resetPasswordEmailTemplate(resetLink), // html body
  });

  console.log("Message sent: %s", info.messageId);
  return res.json({message:'Email with reset link sent to requesting customer if it exists in our records'})
})

// Need to test with front end
router.get('/resetPassword', async(req,res) => {
  // Get reset token from request URL query
  const resetToken = req.query.resetToken
  // Validate token to get the userID, ensuring the token is valid and not expired.
  const resetTokenPayload = verify(resetToken, tokenSecret)
  if(resetTokenPayload instanceof Error){
    return res.json({error: new Error('Invalid link')})
  }
  // Query the 'ResetRequest' table to confirm the the 'AccessToken' is null and that the token's match. If not, display that the link expired and a new link needs to be requested. Finally, remove the token from the record since it's considered 'no good'.
  const match = await queries.getResetToken(resetToken)
  console.log('Result from checking if reset tokens match: ', match)
  if(match instanceof Error) return res.json({error:'ERROR: Could not execute query for reset token'})
  if(match.rowCount === 0) return res.json({error:'ERROR: Reset token does not exist in database.'})
  if(match.rows[0].accessed_at) return res.json({error:'ERROR: Reset request has already been accessed'})
  const accessedAt = await queries.setResetAccessedAtTimestamp(resetToken)
  if( accessedAt instanceof Error) return res.json({error:'ERROR: Did not set an accessed_at timestamp after reset token lookup.'})
  return res.redirect(`http://localhost:3001/resetPassword?resetToken=${resetToken}`)
})

// Need to test with front end
router.post('/resetPasswordConfirmation', (req,res) => {
  const resetToken = req.query.resetToken
  const resetSecret = process.env.RESET_SECRET
  const resetTokenPayload = verify(resetToken, resetSecret)
  const ownerId = resetTokenPayload.ownerId
  // Get new password from request body
  const newPassword = req.body.inputValue
  // Update password in db 
  const saltRounds = 5
  bcrypt.hash(newPassword, saltRounds, async(err,passwordHash) => {
    //store user in DB
    try{
      const updatedOwnerData = {
        ownerId:ownerId,
        fields:'passwordHash',
        newValues:passwordHash
      }
      await queries.updateOwner(updatedOwnerData)
    }catch(e){
      return res.json({error:'ERROR: Could not save info to db'})
    }
    if(err) return res.send(err)
  })
  return res.json({message:'Successfully saved new password'})
})
// Need to test with front end
router.get('/invitation', async(req,res) => {
  // Check if link has been accessed before.
  const invitationToken = req.query.invitationToken
  if(!invitationToken) return res.send('ERROR: Invitation token not provided.')
  const invitationSecret = process.env.INVITATION_SECRET
  const inviteExists = await queries.getInvitationId(invitationToken)
  if(!inviteExists) return res.send('This invite does not exist')
  const mint = await queries.getLastAccessedTimestamp(invitationToken)
  console.log('Invitation token is mint? ',mint)
  // If token has been accessed (i.e., not 'mint'), reject this request by sending error.
  if(!mint) return res.json({error: new Error('Link has been used')})
  // CHECK IF INVITED USER IS NEW OR REGISTERED
  const expectedReceivingOwnerId = await query.getInvitedOwnerIdFromInvite(invitationToken)
  if(!expectedReceivingOwnerId){
      // Redirect to sign-UP page along with invitation token
      return res.redirect(`http://localhost:3001/sign-up?invitationToken=${invitationToken}`)
  }else{
      // Check the client attempting to accept the invite matches with the intended invite recipient
      const invitationTokenPayload = jwt.verify(invitationToken, invitationSecret)
      // Return error: Either expired token or tampered with
      if(invitationTokenPayload instanceof Error){
      return res.json({error: new Error('Invalid link')})
      }
      console.log('Token is valid; payload: ', invitationTokenPayload)
  // EXTRACT THE 'RECEIVING OWNER ID'
  // const receivingOwnerId = payload.receivingOwnerId
  // IF NULL, THE INTENDED RECEPIENT IS A NEW USER AND WILL NEED TO SIGN UP
      const accessToken = req.headers['authorization']
      if(!accessToken){
      // Redirect to sign-IN page along with invitation token
      return res.redirect(`http://localhost:3001/sign-in?invitationToken=${invitationToken}`)
      }
      const accessTokenSecret = process.env.ACCESS_SECRET
      const accessTokenPayload = jwt.verify(accessToken, accessTokenSecret)
      const clientOwnerId = accessTokenPayload.ownerId
      if(clientOwnerId !== expectedReceivingOwnerId) return res.send('Error: The invite does not match your account ID; request a new invitation to the email your account is registered with.')
  }
  // const newPetsIdArray = payload.newPetIdsArray
  // Check if there's a matching token from the respective sender.
  // const match = await queries.compareSavedInvitatonToken(invitationToken,sendingOwnerId) 
  // console.log('Match result:', match)
  // If one does not exist, send error
  // if(!match){
  //   return res.json({error: new Error('Invite is invalid, stored token does not match.')})
  // }
  // Check if this token has been used prior.
  try{
      const result = await queries.setInvitationAccessedAtTimestamp(invitationToken)
      // if(!result) return res.send('server, line 301 => Error adding timestamp')
      // Set the content type to text/html
      // res.setHeader('Content-Type', 'text/html');
      // // Send the HTML as the response
      // if(!receivingOwnerId){
      //   return res.send(newUserHtmlContent)
      // }else{
      //   return res.send(exisitingUserHtmlContent)
      // }
  }catch(e){
      console.log('Error setting Invite Link timestamp', e)
  }

  return res.redirect(`http://localhost:3001/acceptInvite?invitationToken=${invitationToken}`)
  // Check if link has been accessed before.
  // const invitationToken = req.query.invitationToken
  // const invitationSecret = process.env.INVITATION_SECRET
  // const mint = await queries.getLastAccessedTimestamp(invitationToken)
  // console.log('Invitation token is mint? ',mint)
  // // If token has been accessed (i.e., not 'mint'), reject this request by sending error.
  // if(!mint) return res.json({error: new Error('Link has been used')})
  // // CHECK IF INVITED USER IS NEW OR REGISTERED
  // const expectedReceivingOwnerId = await query.getInvitedOwnerIdFromInvite(invitationToken)
  // if(!expectedReceivingOwnerId){
  //   // Redirect to sign-UP page along with invitation token
  //   return res.redirect(`http://localhost:3001/sign-up?invitationToken=${invitationToken}`)
  // }else{
  //   // Check the client attempting to accept the invite matches with the intended invite recipient
  //   const payload = jwt.verify(invitationToken, invitationSecret)
  //   // Return error: Either expired token or tampered with
  //   if(payload instanceof Error){
  //     return res.json({error: new Error('Invalid link')})
  //   }
  //   console.log('Token is valid; payload: ', payload)
  // // EXTRACT THE 'RECEIVING OWNER ID'
  // // const receivingOwnerId = payload.receivingOwnerId
  // // IF NULL, THE INTENDED RECEPIENT IS A NEW USER AND WILL NEED TO SIGN UP
  //   const accessToken = req.headers['authorization']
  //   if(!accessToken){
  //     // Redirect to sign-IN page along with invitation token
  //     return res.redirect(`http://localhost:3001/sign-in?invitationToken=${invitationToken}`)
  //   }
  //   const accessTokenSecret = process.env.ACCESS_SECRET
  //   const accessTokenPayload = jwt.verify(accessToken, accessTokenSecret)
  //   const clientOwnerId = accessTokenPayload.ownerId
  //   if(clientOwnerId !== expectedReceivingOwnerId) return res.send('Error: The invite does not match your account ID; request a new invitation to the email your account is registered with.')
  // }
  // // const newPetsIdArray = payload.newPetIdsArray
  // // Check if there's a matching token from the respective sender.
  // // const match = await queries.compareSavedInvitatonToken(invitationToken,sendingOwnerId) 
  // // console.log('Match result:', match)
  // // If one does not exist, send error
  // // if(!match){
  // //   return res.json({error: new Error('Invite is invalid, stored token does not match.')})
  // // }
  // // Check if this token has been used prior.
  // try{
  //   const result = await queries.setInvitationAccessedAtTimestamp(invitationToken)
  //   if(!result) return res.send('server, line 301 => Error adding timestamp')
  //   // Set the content type to text/html
  //   // res.setHeader('Content-Type', 'text/html');
  //   // // Send the HTML as the response
  //   // if(!receivingOwnerId){
  //   //   return res.send(newUserHtmlContent)
  //   // }else{
  //   //   return res.send(exisitingUserHtmlContent)
  //   // }
  // }catch(e){
  //   console.log('Error setting Invite Link timestamp', e)
  // }

  // return res.redirect(`http://localhost:3001/acceptInvite?invitationToken=${invitationToken}`)
})

router.use(verifyAccessToken)
router.use(verifyRefreshToken)

// router.post('/test', (req,res) => {
//   console.log('New Access Token: ', req.newAccessToken)
//   console.log('New Refresh Token: ', req.newRefreshToken)
//   res.send({accessToken: req.newAccessToken, refreshToken:req.newRefreshToken})
// })

// NEW GAME PLAN: When attempting to add pets, only add new pets. If a pet already exists and has an active link, let user know they need an invite.
router.post('/addPets', async(req,res,next) => {
  // Confirm owner ID from accessToken exists
  const ownerId = req.ownerId
  // if (!ownerId) return res.send('User is not logged in or does not have an account')
  // Expecting an object made with the following structure: {petData: [ [name1,dob1,sex1],[name2,dob2,sex2], ... ]}
  const petDataArray = req.body.petData
  console.log('Incoming pet data array: ', petDataArray)
  
  const sortedIncomingPetData = async( arrayOfIncomingPets ) => {

    const processedPetDataArray = []
    const excludedPetIdArray = []

    console.log('Array of newl added pet data before the async fucntion: ', processedPetDataArray)
    console.log('Array of excluded pet data before the async fucntion: ', excludedPetIdArray)

    for(const petArray of arrayOfIncomingPets){
      try{
          console.log('Line 367, pet data: ', ...petArray)
          let petId = await queries.getPetId(...petArray)
          console.log('petId retrieved from incoing pet Data: ', petId)
          if(petId === null){
            petId = await queries.addPet(...petArray)
            const result = await queries.addPetOwnerLink(ownerId,[petId])
            processedPetDataArray.push(petId)
            console.log('Result of adding new pet to processPetDataArray during the for...of loop: ',processedPetDataArray)
          }else{
            // Check if pet has an active link with any owner. If not, create link between owner and pet. If so, send err message where user requires invite.
            const activeLinksArray = await queries.getActivePetLinks(petId)
            console.log('accountRouter, line 367, activeLinksArray: ', activeLinksArray)
            const activeLinkExists = activeLinksArray.length >= 1
            console.log(activeLinksArray, activeLinksArray.length)
            if(activeLinkExists) excludedPetIdArray.push(petId)
            else {
              await queries.addPetOwnerLink(ownerId,[petId])
              processedPetDataArray.push(petId)
            }
          }
        //petDataArray.forEach( async(petData) => {
        console.log('Array of pet data after the async fucntion: ',processedPetDataArray)
        console.log('Array of excluded pet data before the async fucntion: ', excludedPetIdArray)
        
      } catch(e){
        console.log('Error attempting to add pet: ',e)
        excludedPetIdArray.push(petArray)
      }
    }
    return { processedPetDataArray, excludedPetIdArray }
  }
  const result = await sortedIncomingPetData(petDataArray)
  res.locals.data = result
  return next()
})


router.post('/updatePet', async(req,res,next) => {
  const ownerId = req.ownerId
  // if (!ownerId) return res.send('User is not logged in or does not have an account')
  // Check the request object inlcudes all the correct keys
  const updatedData = Object.keys(req.body.updatePetData)
  const expectedKeys = ['petId','fields','newValues']
  const validateUpdateData = expectedKeys.map( key => {
    const test = updatedData.includes(key)
    return test
  })
  if(validateUpdateData.includes(false)) {
    res.locals.error = 'ERROR: Invalid update request'
    return next()
  }
  // Confirm pet IDs belong to owner making the request
  const petId = req.body.updatePetData.petId
  console.log('petId passed into route: ', petId)
  const ownerLinkIsActive = await queries.checkOwnerLink(ownerId,petId)
  console.log('OwnerLinkIsActive result: ',ownerLinkIsActive)
  if(!ownerLinkIsActive) {
    res.locals.error = 'Account not registered with pet.'
    return next()
  }
  const result = await queries.updatePet(req.body.updatePetData)
  if(result.rowCount) {
    res.locals.message = 'Successfully updated pet data'
    return next()
  }else{
    res.locals.error = 'Error adding pet data'
    return next()
  }
})

router.post('/breakOwnerLink', async(req,res,next) => {
  const ownerId = req.ownerId
  // if (!ownerId) return res.send('User is not logged in or does not have an account')
  const petId = req.body.petId
  const result = await queries.deactivatePetOwnerLink(ownerId,petId)
  console.log('Result from querying "deactivePetOwnerLink": ', result)
  if(result.rowCount) {
    res.locals.message = 'Successfully removed link'
    return next()
  }else{ 
    res.locals.error = 'Error supressing link'
    return next()
  }
})
// Need to test with front end
router.post('/sendInvite', async(req, res, next) => {
  // Utility function
  const confirmIdsExist = (requestedPetIds,linkedPetIds) => {
    const result = requestedPetIds.every(id => linkedPetIds.includes(id))
    return result
  }
  const ownerId = req.ownerId
  const { receivingOwnerEmail, newPetIdsArray } = req.body
  if(!(receivingOwnerEmail && newPetIdsArray)) return res.locals.error = 'Invalid request'
  const verifiedLinkedPetIds = await queries.getOwnersPetIds( ownerId )
  console.log('Verified linked pet ids: ', verifiedLinkedPetIds)
  const verifiedIdsExist = confirmIdsExist(newPetIdsArray,verifiedLinkedPetIds)
  if(!verifiedIdsExist) return res.locals.error = 'Can\'t find a link to one or more of these pets'
  const receivingOwnerId = await queries.getOwnerId('email',receivingOwnerEmail);
  const invitationSecret = process.env.INVITATION_SECRET
  const invitationForm = (link) => {
    return `
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML Form</title>
    </head>
    <body>
        <h1>Someone wants share their pet's activity with you!</h1>
        <h2>If you are ready to accept, click the link below.</h2>
        <h3>This is a one-time link. It will expire after clicking it or 24 hours from now. If you need a new one, please request a new invitation from the member attempting to add you.<h3>
        <a href=${link} target="_blank">Show me the activity</a>
    </body>
  `}
  const payload = {
    ownerId, 
    // receivingOwnerId, 
    newPetIdsArray
  }
  const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })

  if(receivingOwnerId){
    try{
      const result = await queries.addInvitationLink(ownerId, receivingOwnerId,invitationToken)
      // 4. Create a link that contains this JWT in the URL.
    }catch(e){
      res.locals.error = e
      return next()
    }
  }else{
    try{
      const result = await queries.addInvitationLink(ownerId, invitationToken)
    }catch(e){
      res.locals.error = e
      return next()
    }
  }

  const addPetOwnerLink = `http://localhost:3000/acceptInvite?invitationToken=${invitationToken}`
  try{
    const info = await transporter.sendMail({
      from: companyEmail, // sender address
      to: receivingOwnerEmail, // list of receivers
      subject: "A Tully's Toots Member is Inviting You!", // Subject line
      html: invitationForm(addPetOwnerLink), // html body
    });
    console.log('Line 101 => ', info)
    return res.locals.message = 'Link sent'
  }catch(e){
    res.locals.error = e
    return next()
  }
})
// Need to test with front end
router.post('/acceptInvite', async(req,res,next) => {
  const invitationToken = req.query.invitationToken
  if(!invitationToken) return res.locals.json({error:'ERROR: Missing invitation'})
  const invitationSecret = process.env.INVITATION_SECRET
  const invitationTokenPayload = jwt.verify(invitationToken, invitationSecret)
  // Return error: Either expired token or tampered with
  if(invitationTokenPayload instanceof Error) return res.locals.error = new Error('Invalid link')

  const ownerId = req.ownerId
  const expectedReceivingOwnerId = await queries.getInvitedOwnerIdFromInvite(invitationToken)
  // Confirm the clinet attempting to use the invitation token matches with the invitation's target recepient.
  if(ownerId !== expectedReceivingOwnerId) return res.locals.error = 'Error: The invite does not match your account ID; request a new invitation to the email your account is registered with.'
  // Expecting to receive the specific pet IDs the invite recepient is claiming.
  const petIdsArray = req.body.petsClaimed

  try{
		await queries.setInvitationAccessedAtTimestamp(invitationToken)
    const result = await queries.addPetOwnerLink(ownerId,petIdsArray)
  }catch(e){
    res.locals.json({error:'ERROR: Could not link pets to owner'})
    return next()
  }
  res.locals.json({message:'Successfully added pets'})
  return next()
})

router.use(postProcessing)

router.use((error,req,res,next) => {
  console.log('Error handler received the following error: ', error)
})

export default router