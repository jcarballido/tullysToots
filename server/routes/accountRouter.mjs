import express from 'express'
import queries from '../queries/queries.mjs'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import verifyAccessToken from '../middleware/verifyAccessToken.mjs'
import verifyRefreshToken from '../middleware/verifyRefreshToken.mjs'
import postProcessing from '../middleware/postProcessing.mjs'
import cookieParser from 'cookie-parser'
import util from 'util'
import RefreshTokenMismatchError from '../errors/RefreshTokenMismatchError.js'
import nullRefreshTokenError from '../errors/nullRefreshTokenError.mjs'
import crypto from 'crypto'

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

router.get('/refreshAccessToken', async (req,res) => {
  // Validate refresh token
  const refreshToken = req.cookies.jwt
  console.log('Refresh token received in refreshTokenAccess GET request: ', refreshToken)
  if(!refreshToken) return res.status(400).json({ error: new nullRefreshTokenError('Refresh token missing.')})
  const refreshSecret = process.env.REFRESH_SECRET
  const accessSecret = process.env.ACCESS_SECRET
  try{
    // Verify and decode JWT
    const decodedJwt = jwt.verify(refreshToken,refreshSecret)
    // Capture ownerId from token payload
    const { ownerId } = decodedJwt
    console.log('Owner ID decoded in refreshTokenAccess: ', ownerId)
    // Compare refresh token to what is saved in DB for this specific account
    const storedRefreshToken = await queries.getRefreshToken(ownerId)
    const compareRefreshTokens = refreshToken == storedRefreshToken
    if(compareRefreshTokens){
      // Generate new access token
      const newAccessToken = jwt.sign({ ownerId }, accessSecret,{ expiresIn: '10m' })
      // Send the new access token and a HTTP status of 200    
      return res.status(200).json({newAccessToken}) 
    }else{
      console.log('Compare refresh token returned FALSE')
      throw new RefreshTokenMismatchError('Tokens don\'t match')
    }  
  } catch(err){
      if(err instanceof jwt.TokenExpiredError){
        return res.status(400).json({ err })
      }else if(err instanceof jwt.JsonWebTokenError && err.message == 'invalid signature'){
        return res.status(400).json({ err })
      }else if(err instanceof RefreshTokenMismatchError){
        console.log('Error is instance of Refresh token mismatch: ', err)
        return res.status(400).json({ err })
      }else{
        return res.status(400).json({error: "Undesignated error"})
      }
  }
})

router.get('/checkLoginSession', async(req,res, next) => {
  console.log('checkLoginSession request received')
  const encodedInviteToken = req.query.invite
  const decodedInviteToken = JSON.parse(decodeURIComponent(encodedInviteToken))
  console.log('Decoded request query for checkLoginSession: ', decodedInviteToken)
  if(decodedInviteToken) console.log('Invitation token detected')
  else console.log('Invitation was NULL')
  const refreshToken = req.cookies.jwt
  if( !refreshToken && decodedInviteToken ) {
    req.invitationToken = decodedInviteToken
    req.newSession = true
    return next()
  }else if(!refreshToken && !decodedInviteToken){
    return res.status(200).json({message:'New Session'})
  }
  try {
    const decodedJwt = jwt.verify( refreshToken, process.env.REFRESH_SECRET )
    req.decodedJwt = decodedJwt
  } catch (error) {
    console.log('decodedJwt returned an error')
    return res.status(200).json({ error:'Session expired. Login required.' })
  }
  const accessSecret = process.env.ACCESS_SECRET
  const ownerId = req.decodedJwt.ownerId
  const accessToken = jwt.sign({ ownerId }, accessSecret, { expiresIn:'15m' })
  // req.accessToken = accessToken
  if(!decodedInviteToken){
    return res.status(200).json({accessToken})
  }
  req.invitationToken = decodedInviteToken
  req.accessToken = accessToken
  req.ownerId = ownerId
  next()
  // return res.status(200).json({ accessToken })
})


const updateInvitationStatus = async(req,res,next) => {
  console.log('UpdateInvitationStatus middleware ran')
  if(req.newSession){
    console.log('Invitation token detected in middleware AND it\'s a new session')
    try {
      const decodedJwt = jwt.verify( req.invitationToken, process.env.INVITATION_SECRET )
    } catch (error) {
      console.log('Error decoding invitation JWT token. ')
      try {
        const accessedTimestamp = await queries.getAccessedTimestamp(req.invitationToken)
        if(!accessedTimestamp) {
          console.log('An accessed timestamp does not exist. Attempt is made to add')
          await queries.setInvitationAccessedAtTimestamp(req.invitationToken)
          console.log('Accessed Timestamp successfully added.')
        }
      } catch (error) {
        console.log('Error attempting to read or set an \'accessed\' timestamp.')
        return res.status(200).json({ error:'Error attempting to read or set an \'accessed\' timestamp' })
      }
      // await queries.addAccessedTimestamp(req.invitationToken)
      // await queries.setInvalidInvitationToken(req.invitationToken)
      return res.status(200).json({ error:'Expired Invite' })
    }
    try {
      const accessedTimestamp = await queries.getAccessedTimestamp(req.invitationToken)
      if(!accessedTimestamp) {
        console.log('An accessed timestamp does not exist. Attempt is made to add...')
        await queries.setInvitationAccessedAtTimestamp(req.invitationToken)
        console.log('Accessed Timestamp successfully added.')
      } else{
        return res.status(200).json({ error:'Invite has already been accessed' })
      }

      // await queries.addAccessedTimestamp(req.invitationToken)
      // await queries.setInvalidInvitationToken(req.invitationToken)
      return res.status(200).json({ message:'Valid invite and new session'})
    } catch (error) {
      console.log('Error attempting to read or set an \'accessed_at\' timestamp: ', error)
      return res.status(200).json({ message:'Valid invite and new session'})      
    }
    // CHECK LOGIC HERE
    // try{
    //   const result = await queries.checkValidity(req.invitationToken)
    //   if(result) throw new Error('Invitation token has already been accessed')
    // }catch(e){
    //   console.log('Error thrown, invite is invalid: ', e)
    //   return res.status(200).json({ error:'Expired invite' })
    // }
    // try{
    //   await queries.addAccessedTimestamp(req.invitationToken)
    //   await queries.setInvalidInvitationToken(req.invitationToken)
    //   return res.status(200).json({ message:'Valid invite and new session'})
    // }catch(e){
    //   console.log('Error returned from attempting to add timestamp to invite token: ',e)
    //   return res.status(200).json({ error:'Could not add accessed_at data for token'})
    // }
  }
  if(req.invitationToken){
    console.log('Invitation token detected in middleware for an existing user')
    try {
      const decodedJwt = jwt.verify( req.invitationToken, process.env.INVITATION_SECRET )
      console.log('Invite JWT successfully decoded.')
    } catch (error) {
      console.log('Error decoding invitation JWT token. ')
      try {
        const accessedTimestamp = await queries.getAccessedTimestamp(req.invitationToken)
        if(!accessedTimestamp) {
          console.log('An accessed timestamp does not exist. Attempt is made to add')
          await queries.setInvitationAccessedAtTimestamp(req.invitationToken)
          console.log('Accessed Timestamp successfully added.')
        }
        // Need to INVALIDATE the invitation token
        else await queries.setInvalidInvitationToken(req.invitationToken)
      } catch (error) {
        console.log('Error attempting to read or set an \'accessed\' timestamp.')
        return res.status(200).json({ accessToken:req.accessToken, error:'Error attempting to read or set an \'accessed\' timestamp' })
      }
      // await queries.addAccessedTimestamp(req.invitationToken)
      // await queries.setInvalidInvitationToken(req.invitationToken)
      return res.status(200).json({ accessToken: req.accessToken,error:'Expired Invite' })
    }
    // try{
    //   const result = await queries.checkValidity(req.invitationToken)
    //   if(result) throw new Error('Invitation token has already been accessed')
    // }catch(e){
    //   console.log('Error thrown checking if an accessed timestamp exists: ', e)
    //   return res.status(200).json({ accessToken: req.accessToken, error:'Expired invite' })
    // }

    // const decodedJwt = jwt.verify( req.invitationToken, process.env.INVITATION_SECRET )
    // if(decodedJwt instanceof Error){
    //   console.log('Error decoding invitation JWT token: ', decodedJwt)
    //   await queries.setInvalidInvitationToken(req.invitationToken)
    //   return res.status(200).json({ accessToken: req.accessToken, error:'Expired Invite' })
    // }
    // Store invitations in OWNERS table, Need to add column for invites as array type
    
    // try{
    //   // await queries.getAccessedTimestamp(req.invitationToken)
    //   await queries.addAccessedTimestamp(req.invitationToken)
    //   await queries.setInvalidInvitationToken(req.invitationToken)
    // }catch(e){
    //   console.log('Error returned from attempting to add timestamp to invite token: ',e)
    //   return res.status(200).json({accessToken: req.accessToken, error:'Could not add accessed_at data for token'})
    // }
    try {
      const accessedTimestamp = await queries.getAccessedTimestamp(req.invitationToken)
      console.log('Acessed timestamp result: ', accessedTimestamp)
      
      if(!accessedTimestamp) {
        try {
          console.log('An accessed timestamp does not exist. Attempt is made to add')
          await queries.setInvitationAccessedAtTimestamp(req.invitationToken)
          console.log('Attempting to invalidate the token.')
          await queries.setInvalidInvitationToken(req.invitationToken)
          console.log('Accessed Timestamp successfully added and invalidated.')
        } catch (error) {
          console.log('Error caught when attempting to add a timestamp or invalidate the token: ', error)
          return res.status(200).json({ accessToken: req.accessToken, error: 'Could not add timestamp or invalidate token' })
        }
      }
      // Need to INVALIDATE the invitation token

      // else {
      //   console.log('Accessed timestamp returned in updateInvitationStatus: ', accessedTimestamp)
      //   return res.status(200).json({ accessToken:req.accessToken, error:'Link has expired. Please request a new one.' })}
    } catch (error) {
      console.log('Error attempting to read or set an \'accessed\' timestamp.')
      return res.status(200).json({ accessToken:req.accessToken, error:'Error attempting to read or set an \'accessed\' timestamp. Request a new one' })
    }

    try {
      console.log('Attempting to invalidate the token.')
      await queries.setInvalidInvitationToken(req.invitationToken)
      console.log('Accessed Timestamp successfully invalidated.')
    } catch (error) {
      console.log('Failed to invalidate the token due to error: ', error)
      return res.status(200).json({ accessToken:req.accessToken, error:'Error attempting to invalidate invite token. Request a new one' })      
    }

    try{
      console.log('Attempting to store token with owner')
      await queries.storeInvitationToken(req.invitationToken, req.ownerId)
      return res.status(200).json({ accessToken: req.accessToken })
    } catch(e){
      console.log('Error returned from trying to store the invitation token to the user: ', e)
      return res.status(200).json({accessToken: req.accessToken,error:'Could not attach token to owner'})
    }
    // return res.status(200).json({ accessToken: req.accessToken })
  }
  next()
}

router.post('/sign-up', async(req,res,next) => {
  console.log('Sign-up request received')
  //Capture the invitation token
  const encodedInviteToken = req.query.invite
  const decodedInviteToken = JSON.parse(decodeURIComponent(encodedInviteToken))
  // Alert if the token exists
  if(decodedInviteToken) console.log('Invitation token detected: ', decodedInviteToken)
  else console.log('Invitation was NULL')
  // Check to see if a session is currently active
  const requestRefreshToken = req.cookies.jwt
  if(requestRefreshToken) return res.status(200).json({error: 'User is currently logged in'})
  // Extract email and password from req.body
  const { username, email, password } = req.body
  if( !username || !email || !password) return res.status(200).json({error:'Missing credentials'})
  // Validate
  // Confirm email is unique
  try {
    const uniqueCredentials = await queries.checkExistingCredentials(username,email)
    if(!uniqueCredentials) return res.status(200).json({ error: 'Email or username already exists. Please sign in or request a password reset'})
  } catch (error) {
    console.log('Error checking credentials :', error)
    return res.status(200).json({error:'Error checking credentials'})
  }

  // New Flow:
  /*
  // Add new owner to DB with: provided email and username AND auto generated password (temporary)
  // Take the new owner ID, attach it to the request body and generate an access token and refresh token.
  // Send responses and attach other variables to request body
  // Hash password and update owner entry with bcrypt.
  */
  const generateTempPassword = (length) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  } 
  try {
    const tempPassword = generateTempPassword(16);
    const owner = await queries.addOwner({ email,tempPassword, username } )
    console.log('Owner info receievd from query: ', owner)
    req.ownerId = owner.ownerId
  } catch (error) {
    console.log('Error adding new owner: ', error)      
    return res.status(200).json({error:'Error saving new sign-up.'})
  }

  const ownerId = req.ownerId
  const refreshSecret = process.env.REFRESH_SECRET
  const refreshToken = jwt.sign({ownerId},refreshSecret,{ expiresIn:'14d' })
  const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 14;
  const accessSecret = process.env.ACCESS_SECRET
  const accessToken = jwt.sign({ ownerId }, accessSecret, { expiresIn:'15m' })
  //store user in DB
  res.cookie('jwt',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})

  try {
    const updateResult = await queries.updateOwner(refreshToken,ownerId)
    console.log('Updated owner refresh token.')
  } catch (error) {
    console.log('Error in updating new owner info: ', error)
    return res.status(200).json({error:'ERROR: Could not update new owner with refresh token during sign-up.'})
  }
  if(!decodedInviteToken){
    console.log('An invite token was not detected, access token sent in response.')
    return res.status(200).json({accessToken: req.accessToken})
  }
  const saltRounds = 5
  bcrypt.hash(password, saltRounds, async(err,passwordHash) => {
    try{
      await queries.updatePassword(ownerId,passwordHash)
    }catch(e){
      console.log('Error updating password from the temp password to the provided password.')
      return res.status(400).json({error:'Error finalzing adding owner.'})
    }
  })
  req.invitationToken = decodedInviteToken
  req.accessToken = accessToken
  next()
})

router.post('/sign-in', async(req,res, next) => {
  console.log('Sign in request received')
  //Capture the invitation token
  const encodedInviteToken = req.query.invite
  const decodedInviteToken = JSON.parse(decodeURIComponent(encodedInviteToken))
  // Alert if the token exists
  if(decodedInviteToken) console.log('Invitation token detected: ', decodedInviteToken)
  else console.log('Invitation was NULL')
  // Check to see if a session is currently active
  const refreshToken = req.cookies.jwt
  if(refreshToken) return res.status(200).json({ error :'User is currently logged in' })
  // Extract email and password from req.body 
  const { username, password } = req.body
  if(!username || !password) return res.status(200).json({ error :'Missing credentials' })
  // Confirm user is registered
  try {
    const ownerId = await queries.getOwnerId('username',username)
    console.log('Owner ID found: ', ownerId)
    if(!ownerId) return res.status(400).json({ error:'User does not exist'})
    req.ownerId = ownerId
  } catch (error) {
    console.log('Error getting the owner ID: ', error)
    return res.status(400).json({ error: 'Error attempting to get an owner ID' })
  }
  // Confirm password is correct
  try {
    console.log('Attempting to find owner ID from req.ownerID: ', req.ownerId)
    const passwordHash = await queries.getPasswordHash(req.ownerId)
    console.log('Password hash determined from owner ID: ', passwordHash)
    const passwordMatch = await bcrypt.compare(password, passwordHash)
    req.passwordMatch = passwordMatch  
  } catch (error) {
    console.log('Error attempting to check password provided by user with stored password: ', error)
    return res.status(400).json({error:'Error checking password on server'})
  }
  if(req.passwordMatch){
    // console.log('Passwords matched!')
    const ownerId = req.ownerId
    const accessSecret = process.env.ACCESS_SECRET
    const refreshSecret = process.env.REFRESH_SECRET
    // Create access token
    const accessToken = jwt.sign({ ownerId }, accessSecret, {expiresIn: '15m'})
    // Create refresh token 
    const refreshToken = jwt.sign({ ownerId }, refreshSecret, { expiresIn: '3d' })
    // Set refresh token cookie
    const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 3 // ms/s * s/min * min/hr * hrs/day * num. days
    res.cookie('jwt',refreshToken,{ maxAge: refreshTokenMaxAge, httpOnly:true})
    try {
      const result = await queries.setNewRefreshToken(refreshToken,ownerId)      
    } catch (error) {
      return res.status(400).json({error: 'Could not update refresh token on sign-in'})
    }
    // const invitationToken = req.query.invite
    if(!decodedInviteToken){
      // console.log('Sign-in does not have an invitation token. Access token to be sent is: ', accessToken)
      return res.status(200).json({accessToken: accessToken})
    }
    req.invitationToken = decodedInviteToken
    req.accessToken = accessToken
//     const invitationToken = req.query.invitationToken
//     if(invitationToken){
//       //const result = await query.addReceivingOwnerIdToInvitation(ownerId)
//       try{
//         const result = await query.addReceivingOwnerIdToInvitation(ownerId)
//         // Send access token and invitation token
//         return res.json({accessToken,invitationToken})
//       }catch(e){
//         return res.send('ERROR: Could not add recipient to invitation token')
//       }
//     }else{
//       // Send access token
//       return res.status(200).json({ accessToken })
//     }
//   }else{
//     return res.status(400).json({ error: 'Wrong credentials' })
  }else{
    return res.status(400).json({ error: 'Wrong credentials' })
  }
  next()
})

router.use(updateInvitationStatus)

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

router.get('/verifyInvite', async(req,res) => {
  // Check if owner Id has an invite associated with it
  // Check if invite is still valid (not expired)
  // Parse the invite to capture the pet IDs being shared
  // Get the pet info for the pet IDs shared.
  // Response with the pet info

  // return either nullInvite or sharedPets
})

router.get('/logout', async (req,res) => {
  console.log('Logout request receieved')
  const ownerId = req.ownerId
  console.log(`Logging out owner ID: ${ownerId}`)
  res.clearCookie('jwt')
  // CHORE: Remove refresh token from db
  try {
    await queries.logoutUser(ownerId)
    console.log('Successfuly removed refresh token from DB')
    return res.status(200).send('Cleared')
  } catch (error) {
    console.log('Error logging user out:',error)
    return res.status(400).json({ error: 'Did not successfully log user out' })
  }
  
})

router.get('/getSinglePetId', async(req, res)=>{
  const ownerId=req.ownerId
  try{
    const singlePetId = await queries.getSingleActivePetId(ownerId)
    return res.status(200).json({singlePetId})
  }catch(e){
    return res.status(400).json({error:e})
  }
})

router.post('/addPet', async(req,res) => {
  const ownerId = req.ownerId
  const { pet_name, dob, sex } = req.body
  try{
    const result = await queries.addPet(pet_name,dob,sex)
    console.log('Result from adding pet: ', result)
    const petOwnerLink = await queries.addPetOwnerLink(ownerId,[result])
    console.log('Pet owner link: ', petOwnerLink)
    return res.status(200).send('Successfully added pet')
  }catch(e){
    console.log('Error occured adding pet: ', e)
    return res.status(400).json(new Error('Error adding pet on backend'))
  } 
})

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

router.put('/updatePet', async(req,res) => {
  const ownerId = req.ownerId
  console.log('Owner ID: ', ownerId)
  // if (!ownerId) return res.send('User is not logged in or does not have an account')
  // Check the request object inlcudes all the correct keys
  console.log('Request body: ', req.body)
  const updatedData = req.body
  // const expectedKeys = ['petId','fields','newValues']
  // const validateUpdateData = expectedKeys.map( key => {
  //   const test = updatedData.includes(key)
  //   return test
  // })
  // if(validateUpdateData.includes(false)) {
  //   res.locals.error = 'ERROR: Invalid update request'
  //   return next()
  // }
  // Confirm pet IDs belong to owner making the request
  const petId = updatedData.petId
  console.log('petId passed into request body: ', petId)
  const ownerLinkIsActive = await queries.checkOwnerLink(ownerId,petId)
  console.log('Is link between owner making request and the pet active?: ',ownerLinkIsActive)
  if(!ownerLinkIsActive) {
    return res.status(400).json(new Error('Account not registered with pet.'))
  }
  try{
    const result = await queries.updatePet(updatedData)
    return res.status(200).json(result)
  }catch(e){
    console.log('Error occured in accountRouter attempting to update pet: ', e)
    return res.status(400).json(new Error('Error saving new pet data on server. See server for details'))
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
// router.post('/sendInvite', async(req, res, next) => {
//   // Utility function
//   const confirmIdsExist = (requestedPetIds,linkedPetIds) => {
//     const result = requestedPetIds.every(id => linkedPetIds.includes(id))
//     return result
//   }
//   const ownerId = req.ownerId
//   const { receivingOwnerEmail, newPetIdsArray } = req.body
//   if(!(receivingOwnerEmail && newPetIdsArray)) return res.locals.error = 'Invalid request'
//   const verifiedLinkedPetIds = await queries.getOwnersPetIds( ownerId )
//   console.log('Verified linked pet ids: ', verifiedLinkedPetIds)
//   const verifiedIdsExist = confirmIdsExist(newPetIdsArray,verifiedLinkedPetIds)
//   if(!verifiedIdsExist) return res.locals.error = 'Can\'t find a link to one or more of these pets'
//   const receivingOwnerId = await queries.getOwnerId('email',receivingOwnerEmail);
//   const invitationSecret = process.env.INVITATION_SECRET
//   const invitationForm = (link) => {
//     return `
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>HTML Form</title>
//     </head>
//     <body>
//         <h1>Someone wants share their pet's activity with you!</h1>
//         <h2>If you are ready to accept, click the link below.</h2>
//         <h3>This is a one-time link. It will expire after clicking it or 24 hours from now. If you need a new one, please request a new invitation from the member attempting to add you.<h3>
//         <a href=${link} target="_blank">Show me the activity</a>
//     </body>
//   `}
//   const payload = {
//     ownerId, 
//     // receivingOwnerId, 
//     newPetIdsArray
//   }
//   const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })

//   if(receivingOwnerId){
//     try{
//       const result = await queries.addInvitationLink(ownerId, receivingOwnerId,invitationToken)
//       // 4. Create a link that contains this JWT in the URL.
//     }catch(e){
//       res.locals.error = e
//       return next()
//     }
//   }else{
//     try{
//       const result = await queries.addInvitationLink(ownerId, invitationToken)
//     }catch(e){
//       res.locals.error = e
//       return next()
//     }
//   }

//   const addPetOwnerLink = `http://localhost:3000/invite=${invitationToken}`
//   try{
//     const info = await transporter.sendMail({
//       from: companyEmail, // sender address
//       to: receivingOwnerEmail, // list of receivers
//       subject: "A Tully's Toots Member is Inviting You!", // Subject line
//       html: invitationForm(addPetOwnerLink), // html body
//     });
//     console.log('Line 101 => ', info)
//     return res.locals.message = 'Link sent'
//   }catch(e){
//     res.locals.error = e
//     return next()
//   }
// })

router.post('/sendInvite', async(req,res) => {
  // Capture owner id from request
  const sendingOwnerId = req.ownerId
  // Capture the invitee's email
  const invitedEmail = req.body.email
  // Capture the pet(s) IDs that are being shared
  const petIdsArray = req.body.petsToShareArray

  if(!sendingOwnerId || !invitedEmail || !petIdsArray) return res.status(400).json({message: new Error('Missing critical info to send invite')})

  /* LOGIC */
  // Confirm active link between the sender and pet id(s) included in req.body
  try{
    const isPetOwnerLinkActive = await queries.checkOwnerLink(sendingOwnerId, petIdsArray)
  }catch(e){
    console.log('Error checking for active links between pet and owners: ', e )
    return res.status(400).json({ message: 'One or more of the pets being shared is not linked to your account'})
  }

  // Check if invitee is already registered
  const invitationSecret = process.env.INVITATION_SECRET
  const invitationToken = jwt.sign({ sendingOwnerId, petIdsArray }, invitationSecret, { expiresIn: '1d'})
  const addPetOwnerLink = `http://localhost:3001/?invite=${invitationToken}`
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
  try{
    // add token to invite table
    const addTokenResult = await queries.addInvitationToken(sendingOwnerId, invitedEmail, invitationToken)
    const info = await transporter.sendMail({
      from: companyEmail, // sender address
      to: invitedEmail, // list of receivers
      subject: "A Tully's Toots Member is Inviting You!", // Subject line
      html: invitationForm(addPetOwnerLink), // html body
    });
    console.log('Line 101 => ', info)
    return res.status(200).json({ message: 'Email invitation sent' })
  }catch(e){
    console.log('Error attempting to add invitation token to table: ', e)
    return res.status(400).json({message: 'Could not send invite at this time.'})
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

//CHORE: Finalize and check
router.post('/updatePassword', async (req, res) => {
  const { currentPassword, newPassword } = req.body
  console.log('Update password endpoint hit; currentPassword/newPassword received: ', currentPassword,'/', newPassword)
  const ownerId = req.ownerId
  console.log('Owner ID: ', ownerId)

  try{
    const passwordHash = await queries.getPasswordHash(ownerId)
    const passwordMatch = await bcrypt.compare(currentPassword, passwordHash)
    console.log('Password match? ', passwordMatch)
    if(!passwordMatch) throw new Error('Invalid Password')
    const saltRounds = 5
    const hash = bcrypt.hashSync(newPassword, saltRounds);
    const result = await queries.updatePassword(ownerId,hash)
    return res.status(200).json({ successful:'Password Updated' })
  }catch(e){
    console.log('Error with update password query: ', e)
    return res.status(400).json({updatePasswordError: e})
  }
  
})

router.post('/updateUsername', async (req, res) => {
  const { currentUsername, newUsername } = req.body
  console.log('Update username endpoint hit; currentUsername/newUsername received: ', currentUsername,'/', newUsername)
  const ownerId = req.ownerId
  console.log('Owner ID: ', ownerId)

  try{
    const savedUsername = await queries.getUsername(ownerId)
    const usernameMatch = currentUsername == savedUsername
    if(!usernameMatch) throw new Error('Incorrect Username')
    const result = await queries.updateUsername(ownerId,newUsername)
    return res.status(200).json({ successful:'Username Updated' })
  }catch(e){
    console.log('Error with update username query: ', e)
    return res.status(400).json({updateUsernameError: e})
  }
  
})

router.get('/getPets', async(req,res) => {
  const ownerId = req.ownerId
  try{
    // const confirmedActivePetLinks = await queries.getActivePetLinks(ownerId)
    const pets = await queries.getPets(ownerId)
    // console.log('getPets endpoint, result: ', pets)
    return res.status(200).json(pets)
  }catch(e){
    console.log('Error querying for pets: ', e)
    return res.status(400).json({error:'Error querying for pets'})
  }
})

export default router
// router.use(postProcessing)

// router.use((error,req,res,next) => {
//   console.log('Error handler received the following error: ', error)
// })
// router.get('/refreshAccessToken', (req,res) => {
//   const checkExpiration = (token) => {
//     const payload = jwt.decode(token)
//     return payload.exp < (Date.now() / 1000) // Date.now() must be converted to seconds 
//   }
//   // Validate refresh token
//   const refreshToken = req.cookies.jwt
//   const secret = process.env.REFRESH_SECRET
//   try{
//     const decodedJwt = jwt.verify(refreshToken,secret)
//     // CHORE: Update response
//     // return decodedJwt
//   }catch(err){
//     // Determine if the access token is expired.
//     const expiredRefreshToken = checkExpiration(refreshToken)
//     // If the access token is expired, confirm existence of and valdiate the refresh token.
//     if(expiredAccessToken){
//         // If a refresh token is not present, send a custom error.
//         if(!refreshToken){
//           return res.status(401).json({error: new nullRefreshTokenError('Refresh token was not provided; Requires sign-in')}) // Handled by frontend
//         }
//         console.log('The access token was expired. Checking to see if refresh token is valid...')
//         const refreshTokenValidation = validateToken(refreshToken, 'refresh')
//         // Return any error given after validation.
//         if(refreshTokenValidation instanceof Error){
//           const expiredRefreshToken = checkExpiration(refreshToken)
//           if(expiredRefreshToken){
//             console.log('Refresh token was not valid; expired. Error returned to client.')
//             return res.status(401).json({error: new Error('Refresh token is expired; Requires sign-in')}) // Handled by frontend
//           }else{
//             console.log('Refresh token was not valid; tampered with. Error pushed to error handler in server.')
//             return next(new invalidSignatureError('Invalid signature present on refresh token')) // Additional action required
//           }
//         }
//         else req.refToken = refreshToken
//         // Trigger the need for a new access token and refresh token.
        
//         // req.refreshTokenVerification = true
//         // req.currentRefreshToken = refreshToken
//         // req.tokenPayload = refreshTokenValidation
//         // console.log('The access token was expired. Will pass the following data to the refresh token middleware...')
//         // console.log('refresh token verification: ', req.refreshTokenVerification)
//         // console.log('current refresh token: ', req.currentRefreshToken)
//         // console.log('refresh token payload: ', req.tokenPayload)
//         // return next()
//     }else{
//       // return next(new invalidSignatureError('Invalid signature present on access token')) // Additional action required
//     }
//     return res.status
//   }
// })