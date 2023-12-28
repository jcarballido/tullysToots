import express from 'express'
import queries from '../queries/queries.mjs'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import verifyAccessToken from '../middleware/verifyAccessToken.mjs'
import verifyRefreshToken from '../middleware/verifyRefreshToken.mjs'

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


router.post('/sign-up', async(req,res) => {
  // Extract email and password from req.body
  const { email, password } = req.body
  // Validate
  // Confirm email is unique
  const ownerId = await queries.getOwnerId(email)
  // If userExists returns false...
  if(ownerId) return res.send('ERROR: Email already exists. Please sign in or request a password reset')
  // Create refresh token...
  const refreshSecret = process.env.REFRESH_SECRET
  const refreshToken = jwt.sign({ ownerId }, refreshSecret, { expiresIn:'14d' })
  // Create access token 
  const accessSecret = process.env.ACCESS_SECRET
  const accessToken = jwt.sign({ ownerId }, accessSecret, { expiresIn:'15m' })
  // Hash raw password
  const saltRounds = 5
  bcrypt.hash(password, saltRounds, async(err,passwordHash) => {
    //store user in DB
    const result = await queries.addOwner({ email,passwordHash,refreshToken } )
    console.log(result)
    // if(result == null) return res.send("Error: Failed to svae new sign-up.")
    if(result == null || err) return res.send('Error saving new sign-up.')
    const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 14;
    res.cookie('refreshToken',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})
    const invitationToken = req.query.invitationToken
    if(invitationToken){
      // const receivingOwnerId = await queries.getOwnerId(email)
      try{
        const result = await query.addReceivingOwnerIdToInvitation(ownerId,invitationToken)
      }catch(e){
        console.log('Error updating invitation token with new receiving owner id')
      }
      // Send access and invitation token
      return res.json({accessToken,invitationToken})
    }else{
      // Send access token
      return res.json({accessToken})
    }
  })
})

// *** NEED TO ADD CHECK THAT STOPS A LOGGED IN USER FROM SINGNING IN AGAIN***
router.post('/sign-in', async(req,res) => {
  // Extract email and password from req.body 
  const { email, password } = req.body
  // Confirm user is registered; NEED TO CREATE UserQueries SERVICE\
  const ownerId = await queries.getOwnerId(email)
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
    res.cookie('refreshToken',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})
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

router.use(verifyAccessToken)
router.use(verifyRefreshToken)

router.get('/resetRequest', async(req,res) => {
  const ownerId = req.ownerId
  // Get email associated with owner ID
  const ownerEmail = await queries.getEmail(ownerId)
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
  res.send('Email with reset link to requesting customer')

})

router.get('/resetPassword', async(req,res) => {
  // Get reset token from request body
  const resetToken = req.query.resetToken
  // Validate token to get the userID, ensuring the token is valid and not expired.
  const resetTokenPayload = verify(resetToken, tokenSecret)
  if(resetTokenPayload instanceof Error){
    return res.json({error: new Error('Invalid link')})
  }
  // Query the 'ResetRequest' table to confirm the the 'AccessToken' is null and that the token's match. If not, display that the link expired and a new link needs to be requested. Finally, remove the token from the record since it's considered 'no good'.
  const match = await queries.getResetTokenInfo(resetTokenPayload)
  if(!match) return res.send('ERROR: Reset token does not exist in database.')
  if(match.rows[0].accessed_at) return res.send('ERROR: Reset request has already been accessed')
  const accessedAt = await queries.setResetAccessedAtTimestamp(resetToken)
  if( accessedAt instanceof Error) return res.send('ERROR: Did not set an accessed_at timestamp after reset token lookup.')
  // If so, enter a timestamp under AccessedAt: column. 
  // Send an HTML form to the client for the user to reset their password.
  // const resetPasswordTemplate = `
  //   <html>
  //     <head>
  //       <title>Reset Form</title>
  //     </head>
  //     <body>
  //       <form action="http://localhost:3000/resetPasswordConfirmation" method="post">
      
  //         <label for="inputValue">Enter a value:</label>
  //         <input type="text" id="inputValue" name="inputValue" required>
  
  //         <!-- Submit button -->
  //         <button type="submit">Submit</button>
  //       </form>
  //     </body>
  //   </html>
  // `;
  // Redirect to password reset frontend page
  res.redirect(`http://localhost:3001/resetPassword?resetToken=${resetToken}`)
})

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
      return res.send('ERROR: Could not save info to db')
    }
    if(err) return res.send(err)
  })
  res.send('Successfully saved new password')
})

// NEW GAME PLAN: When attempting to add pets, only add new pets. If a pet already exists and has an active link, let user know they need an invite.
router.post('/addPets', async(req,res) => {
  // Confirm owner ID from accessToken exists
  const ownerId = req.ownerId
  if (!ownerId) return res.send('User is not logged in or does not have an account')
  // Expecting an object made with the following structure: {petData: [ [name1,dob1,sex1],[name2,dob2,sex2], ... ]}
  const petDataArray = req.body.petData
  const processedPetDataArray = []
  const excludedPetIdArray = []
  try{
    petDataArray.forEach( async(petData) => {
      let petId = await queries.getPetId(...petData)
      if(!petId){
        petId = await queries.addPet(...petData)
        const result = await queries.addPetOwnerLink(ownerId,[petId])
        processedPetDataArray.push(petId)
      }else{
        // Check if pet has an active link with any owner. If not, create link between owner and pet. If so, send err message where user requires invite.
        const activeLinksArray = await queries.getActivePetLinks(petId)
        const activeLinkExists = activeLinksArray.length > 1
        if(activeLinkExists) excludedPetIdArray.push(petId)
        else {
          await queries.addPetOwnerLink(ownerId,[petId])
          processedPetDataArray.push(petId)
        }
      }
    })
    return res.json({processedPetDataArray,excludedPetIdArray})
  } catch(e){
    return res.send(e)
  }

})

router.post('/updatePet', async(req,res) => {
  const ownerId = req.ownerId
  const updatedData = req.body.updatedData
  if (!ownerId) return res.send('User is not logged in or does not have an account')
  const result = await queries.updatePet(updatedData)
  if(result.rowCount) return res.send('Successfully updated pet data')
  else return res.send('Error adding pet data')
})

router.post('/breakOwnerLink', async(req,res) => {
  const ownerId = req.ownerId
  const petId = req.petId
  const result = await queries.deactivatePetOwnerLink(ownerId,petId)
  if(result.rowCount) return res.send('Successfully removed link')
  else return res.send('Error supressing link')
})

router.post('/sendInvite', async(req, res) => {
  const confirmIdsExist = (requestedPetIds,linkedPetIds) => {
    const result = requestedPetIds.every(id => linkedPetIds.includes(id))
    return result
  }
  const { sendingOwnerEmail, receivingOwnerEmail, newPetIdsArray } = req.body
  if(!(sendingOwnerEmail || newPetIdsArray)) return res.send('Invalid request')
  const sendingOwnerId = await queries.getOwnerId(sendingOwnerEmail);
  if(!sendingOwnerId) return res.send('We cannot find an account associated with your email')
  const verifiedLinkedPetIds = await queries.getOwnersPetIds( sendingOwnerId )
  console.log('Verified linked pet ids: ', verifiedLinkedPetIds)
  const verifiedIdsExist = confirmIdsExist(newPetIdsArray,verifiedLinkedPetIds)
  if(!verifiedIdsExist) return res.send('Can\'t find a link to one or more of these pets')

  const receivingOwnerId = await queries.getOwnerId(receivingOwnerEmail);
  // console.log('Line 43 => ', sendingOwnerEmail)
  // console.log('Line 44 => ', receivingOwnerEmail)
  // 1. Find sending user ID from email
  //const sendingOwnerId = await queries.getOwnerId(sendingOwnerEmail)
  // Also, confirm if pet-owner links already exist
  const invitationSecret = process.env.INVITATION_SECRET
  /*
  if(receivingOwnerId){
    const payload = {
      sendingOwnerId, 
      //receivingOwnerId, 
      newPetIdsArray
    }
    // 2. Create a JWT where the payload is { userId: userID from query}, and the JWT is named 'resetToken', and an expiration of 10 minutes.
    const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })
    // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
    
    try{
      await queries.addInvitationLink(sendingOwnerId, receivingOwnerId,invitationToken)
      // 4. Create a link that contains this JWT in the URL.
      const addPetOwnerLink = `http://localhost:3000/acceptInvite?invitationToken=${invitationToken}`
      // 5. Send this link via an email to the user's registered email (confirmed in Line 25)
      const info = await transporter.sendMail({
        from: companyEmail, // sender address
        to: receivingOwnerEmail, // list of receivers
        subject: "A Tully's Toots Member is Inviting You!", // Subject line
        html: resetForm(addPetOwnerLink), // html body
      });
      console.log('Line 101 => ', info)
      return res.send('Link sent')
    }catch(e){
      return res.send(e)
    }
  }
  */
  // else{
  const payload = {
    sendingOwnerId, 
    newPetIdsArray
  }
  const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })
  // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
  //console.log('sendingOwnerId: ',sendingOwnerId)
  // NEED TO CHECK FOR ERRORS ADDING ROW IN SQL, EMAIL WILL SEND REGARDLESS
  try{
    await queries.addInvitationLink(sendingOwnerId, receivingOwnerId, invitationToken)
    // 4. Create a link that contains this JWT in the URL.
    const addPetOwnerLink = `http://localhost:3000/invitation?invitationToken=${invitationToken}`
    // 5. Send this link via an email to the user's registered email (confirmed in Line 25)
    const info = await transporter.sendMail({
      from: companyEmail, // sender address
      to: receivingOwnerEmail, // list of receivers
      subject: "A Tully's Toots Member is Inviting You!", // Subject line
      html: resetForm(addPetOwnerLink), // html body
    });
    console.log('Line 101 => ', info)
    return res.send('Link sent')
  }catch(e){
    return res.send(e)
  }
})

router.get('/invitation', async(req,res) => {
  // Check if link has been accessed before.
  const invitationToken = req.query.invitationToken
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

router.post('/acceptInvite', async(req,res) => {
  const invitationToken = req.query.invitationToken
  const invitationSecret = process.env.INVITATION_SECRET
  const invitationTokenPayload = jwt.verify(invitationToken, invitationSecret)
  // Return error: Either expired token or tampered with
  if(invitationTokenPayload instanceof Error) return res.json({error: new Error('Invalid link')})
  // Confirm user is a registered owner that is logged in
  const accessToken = req.headers['authorization']
  // Decode access token for the client's owner ID
  const accessSecret = process.env.ACCESS_SECRET
  const accessTokenPayload = jwt.verify(accessToken,accessSecret)
  if(accessTokenPayload instanceof Error) return res.json({error: new Error('Invalid access token')})
  const clientOwnerId = accessTokenPayload.owner
  const expectedReceivingOwnerId = await queries.getInvitedOwnerIdFromInvite(invitationToken)
  // Confirm the clinet attempting to use the invitation token matches with the invitation's target recepient.
  if(clientOwnerId !== expectedReceivingOwnerId) return res.send('Error: The invite does not match your account ID; request a new invitation to the email your account is registered with.')
  // Expecting to receive the specific pet IDs the invite recepient is claiming.
  const petIdsArray = req.body.petsClaimed
  // EX: [12,9]
  // Add new row(s) to pet_owners table, linking the owner to the pets in petIdsArray
  try{
		await queries.setInvitationAccessedAtTimestamp(invitationToken)
    const result = await queries.addPetOwnerLink(ownerId,petIdsArray)
  }catch(e){
     return res.send('ERROR: Could not link pets to owner')
  }
  return res.send('Successfully added pets')
})

export default router