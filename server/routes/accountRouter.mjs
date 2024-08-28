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
  // MUST RETURN AN OBJECT: { accessToken, error, message }
  console.log('checkLoginSession request received')
  const encodedInviteToken = req.query.invite
  let decodedInviteToken = decodeURIComponent(encodedInviteToken)
  if(decodedInviteToken === 'null') decodedInviteToken = null
  const refreshToken = req.cookies.jwt
  if(!refreshToken){
    if(decodedInviteToken){
      req.invitationToken = decodedInviteToken
      req.guest = true
      return next()
    }
    return res.status(401).json({ message: 'Missing refresh token'})    
  }
  try {
    const decodedJwt = jwt.verify( refreshToken, process.env.REFRESH_SECRET )
    req.decodedJwt = decodedJwt
  } catch (error) {
    console.log('decodedJwt returned an error: ', error)
    return res.status(401).json({ message:'Expired refresh token.' })
  }
  const accessSecret = process.env.ACCESS_SECRET
  const ownerId = req.decodedJwt.ownerId
  const accessToken = jwt.sign({ ownerId }, accessSecret, { expiresIn:'15m' })
  if(decodedInviteToken){
    req.invitationToken = decodedInviteToken
    req.accessToken = accessToken
    req.ownerId = ownerId
    next()
  }
  return res.status(200).json({accessToken})
})

router.post('/sign-up', async(req,res,next) => {
  console.log('Sign-up request received')
  //Capture the invitation token
  const encodedInviteToken = req.query.invite
  let decodedInviteToken = decodeURIComponent(encodedInviteToken)
  if(decodedInviteToken === 'null') decodedInviteToken = null
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
    console.log('Generated temp password: ', tempPassword)
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

  const saltRounds = 5
  bcrypt.hash(password, saltRounds, async(err,passwordHash) => {
    try{
      await queries.updatePassword(ownerId,passwordHash)
    }catch(e){
      console.log('Error updating password from the temp password to the provided password.')
      return res.status(400).json({error:'Error finalzing adding owner.'})
    }
  })

  if(!decodedInviteToken){
    console.log('An invite token was not detected, access token sent in response.')
    return res.status(200).json({accessToken})
  }

  req.invitationToken = decodedInviteToken
  req.accessToken = accessToken
  req.signUp = true
  next()
})

router.post('/sign-in', async(req,res, next) => {
  console.log('Sign in request received')
  //Capture the invitation token
  const encodedInviteToken = req.query.invite
  let decodedInviteToken = decodeURIComponent(encodedInviteToken)
  if(decodedInviteToken === "null") decodedInviteToken = null  // Alert if the token exists
  console.log('Decoded invitation token present:', decodedInviteToken)
  // Check to see if a session is currently active
  const existingRefreshToken = req.cookies.jwt
  if(existingRefreshToken) return res.status(400).json({ error :'User is currently logged in' })
  // Extract email and password from req.body 
  const { username, password } = req.body
  if(!username || !password) return res.status(400).json({ error :'Missing credentials' })
  // Confirm user is registered
  try {
    const ownerId = await queries.getOwnerId('username',username)
    if(!ownerId) return res.status(400).json({ error:'User does not exist'})
    req.ownerId = ownerId
  } catch (error) {
    console.log('Error getting the owner ID: ', error)
    return res.status(400).json({ error: 'Error attempting to get an owner ID' })
  }
  // Confirm password is correct
  try {
    const passwordHash = await queries.getPasswordHash(req.ownerId)
    const passwordMatch = await bcrypt.compare(password, passwordHash)
    req.passwordMatch = passwordMatch  
  } catch (error) {
    console.log('Error attempting to check password provided by user with stored password: ', error)
    return res.status(400).json({error:'Error checking password on server'})
  }
  if(!req.passwordMatch) return res.status(400).json({ error: 'Wrong credentials' })
  
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
  req.signIn = true
  console.log('Sign up endpoint completed. Moving onto next middleware.')
  next()
})

const updateInvitationStatus = async(req,res, next) => {
  console.log('UpdateInvitationStatus middleware ran')
  if(req.invitationToken){
    console.log('Invitation token detected in middleware AND it\'s a guest user')
    try {
      const tokenData = await queries.getTokenData(req.invitationToken)
      console.log('Token data: ', tokenData)
      const { accessed_at, expired } = tokenData
      if((req.signIn || req.signUp) && expired){
        console.log('Expired token, middleware complete.')
        if(expired) return res.status(207).json({ accessToken:req.accessToken, invitationError: 'Invitation token is expired.' })
      }
      if(req.guest && (accessed_at || expired)){
        console.log('Accessed_at property found or expired token, middleware complete.')
        if(req.guest) return res.status(401).json({ guest:true, message: 'Invitation token is expired.' })
      }
      if(!accessed_at){
        // Set a timestamp
        try {
          await queries.setInvitationAccessedAtTimestamp(req.invitationToken)
        } catch (error) {
          console.log('Failed to set expiration to true. Error returned: ', error)
        }
      }
      if(!expired){
        // Decode the invite to check for expiry
        try {
          jwt.verify(req.invitationToken, process.env.INVITATION_SECRET)
        } catch (error) {
          console.log('Token is expired.')
          try {
            await queries.setInviteExpiredByToken(req.invitationToken)
          } catch (error) {
            throw error
          } 
          throw error
        }
      }
    } catch (error) {
      console.log('Error retrieving token data: ', error)
      if(req.guest) return res.status(401).json({ guest:true, message:'Issue validating invitation token.'}) 
      else res.status(207).json({ accessToken:req.accessToken,invitationError: 'Token is expired.' })
    }

    if(req.guest) return res.status(200).json({ message: 'New session and a valid invite is present.' })

    try {
      const invitationId = await queries.getInvitationId(req.invitationToken)
      req.invitationId = invitationId
    } catch (error) {
      console.log('Error querying for invitation id: ', error);
      return res.status(207).json({accessToken:req.accessToken, invitationError:  'Error storing invitation token. Please request a new invite.' })
    }

    try{
      console.log('Attempting to store token with owner')
      await queries.storeInvitationToken(req.invitationId, req.ownerId)
    } catch(e){
      console.log('Error returned from trying to store the invitation token to the user: ', e)
      return res.status(207).json({accessToken: req.accessToken,invitationError:'Could not attach token to owner'})
    }
    return res.status(200).json({ accessToken: req.accessToken, activeInvite: true })
  }

  next()

}

router.post('/forgotPassword', async(req,res) => {

  const ownerEmail = req.body.email

  try {
    const ownerId = await queries.getOwnerIdFromEmail(ownerEmail)
    req.ownerId = ownerId
  } catch (error) {
    console.log('Error getting owner ID from email: ', error)
    return res.status(200).json({ message: 'If we find an account associated with this email, a password reset link will be sent.' })
  }

  const ownerId = req.ownerId
  const resetPasswordSecret = process.env.RESET_SECRET

  const resetPasswordToken = jwt.sign( {ownerId}, resetPasswordSecret, {expiresIn: '10m'} )

  const link = `http://localhost:3000/resetPassword?resetToken=${resetPasswordToken}`
  const resetPasswordEmail = (resetPasswordlink) => {
    return `
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HTML Form</title>
      </head>
      <body>
          <h1>Reset Password Link</h1>
          <h2>Please click the link below to reset your password</h2>
          <h3>If you did not request to reset your password, please ignore this message.<h3>
          <a href=${resetPasswordlink} target="_blank">RESET PASSWORD</a>
      </body>
    `
  }

  try {
      const result = await queries.addResetToken(ownerId, resetPasswordToken)
  } catch (error) {
      console.log('Error storing reset token in database: ', error)
      return res.status(400).json({ error: 'Server error attempting to send a link, please try again.' })
  }

  try{
    const info = await transporter.sendMail({
      from: companyEmail, // sender address
      to: ownerEmail, // list of receivers
      subject: "Password Reset from Tully's Toots", // Subject line
      html: resetPasswordEmail(link), // html body
    });
    console.log('Line 101 => ', info)
    return res.status(200).json({ message: 'If we find an account associated with this email, a password reset link will be sent.' })
  }catch(e){
    console.log('Error attempting to add invitation token to table: ', e)
    return res.status(400).json({error: 'Server error attempting to send a link, please try again.'})
  }

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

// router.get('/verifyInvite', async(req,res) => {
//   // Check if owner Id has an invite associated with it
//   // const ownerId = req.ownerId
//   const ownerId = req.body.ownerId
//   const invitationSecret = process.env.INVITATION_SECRET

//   const getArrayPetIdArrays = async(invitationsArray) => {
//     const promiseArray = invitationsArray.map( async(inviteObj)=> {
//       const invite = inviteObj.invitation_token
//       console.log('Invite passed in to getArrayPetIdArray:', invite)
//       try {
//         const decodeInvite = jwt.verify(invite,invitationSecret)
//         // console.log('Decoded Invite: ', decodeInvite)
//         const petIdArray = decodeInvite.petIdArray
//         const sendingOwnerId = decodeInvite.sendingOwnerId
//         const sendingOwnerUsername = await queries.getUsername(sendingOwnerId)
//         const inviteId = await queries.getInvitationId(invite)
//         return { inviteId, sendingOwnerUsername, petIdArray }
//       } catch (error) {
//         console.log('Error decoding invitation: ', error)
//         try{
//           await queries.setInviteExpiredByToken(invite) 
//         }catch(error){
//           console.log('Error setting token as expired: ', error)
//           return 
//         }
//         return null
//       }
//     })
//     try {
//       const arrayPetIdArrays = await Promise.allSettled(promiseArray)
//       const filteredArrayPetIdArrays = arrayPetIdArrays?.filter( petIdArray => petIdArray.value != null)
//       const arrayPetIdArrayValues = filteredArrayPetIdArrays.map( nonNullPetIdAray => nonNullPetIdAray.value)
//       return arrayPetIdArrayValues 
//     } catch (error) {
//       console.log('Error processing invitations: ', error)
//     }
//   }
//   // GET PET INFO
//   const processPetIds = async(petIdsArray) => {
//     // Create Promise array of fetching pet info
//     const promiseArray = petIdsArray.map( async( petId ) => {
//       try {
//         const result = await queries.getPetInfo(petId)
//         return result.rows[0]
//       } catch (error) {
//         console.log(`Error getting pet Info for petId ${petId}: `, error)
//         return null
//       }
//     })

//     try {
//       const result = await Promise.allSettled(promiseArray)
//       const filteredResult = result.filter( petInfo => petInfo != null )
//       const resultValues = filteredResult.map( petInfoPromise => petInfoPromise.value)
//       return resultValues
//     } catch (error) {
//       console.log('Error in awating promises settling: ', error)
//       return null
//     }
//     // Values returned are non-null
//   }
//   // GET pet info from pet IDs array
//   const getArrayPetInfoArrays = async(arrayDecodedJWT) => {
//     // console.log('array of decoded JWT: ', arrayDecodedJWT)
//     // const sendingOwnerId = arrayDecodedJWT.sendingOwnerId
//     // const petIdArray = arrayDecodedJWT.petIdArray
//     const promiseArray = arrayDecodedJWT.map( async(decodedInvite) => {
//       const petIdArray = decodedInvite.petIdArray
//       const sendingOwnerUsername = decodedInvite.sendingOwnerUsername
//       const inviteId = decodedInvite.inviteId
//       try {
//         // console.log('Processing pet ID array: ', petIdArray)
//         const petInfo = await processPetIds(petIdArray)
//         // console.log('Received the folowing pet id: ', petInfo)
//         return {inviteId, sendingOwnerUsername, petInfo}
//       } catch (error) {
//         throw error
//       }
//     })

//     try {
//       const petInfo = await Promise.allSettled(promiseArray)  
//       // console.log('Pet Info Promises returned: ', petInfo)
//       const valuesPetInfo = petInfo.map( petInfoPromiseResult => {
//         // console.log('Pet info promise result: ', petInfoPromiseResult)
//         const promisesArray = petInfoPromiseResult.value 
//         // console.log('Promise array: ', promisesArray)
//         // const infoArray = promisesArray.map( promise => promise.value)
//         // console.log('Info array: ', infoArray)
//         return promisesArray
//       })
//       // console.log('Values from pet info promises returned: ', valuesPetInfo)

//       return valuesPetInfo    
//     } catch (error) {
//       throw error
//     }

//   }

//   try {
//     const invitationTokens = await queries.getInvitationTokens(ownerId)
//     // console.log('Invitation Tokens received from the backend: ', invitationTokens)
//     req.invitationTokens = invitationTokens
//   } catch (error) {
//     console.log('Error querying for invites: ', error)
//     return res.status(400).json({queryError:`Error querying for invites: ${error}`})
//   }

//   if(req.invitationTokens?.length == 0) return res.status(200).json({ emptyInvitations:true })

//   // Check if invite(s) is still valid (not expired)
//   const invitations = [...req.invitationTokens]
//   // if(invitations.length == 0) return res.status(400).json({nullInvites:true})
//   try {
//     const arrayDecodedInvites = await getArrayPetIdArrays(invitations)
//     req.arrayDecodedInvites = arrayDecodedInvites
//   } catch (error) {
//     console.log('Error querying for pet Ids: ', error)
//     return res.status(400).json({queryError:`Error querying for pet Ids: ${error}`})
//   }
//   if(req.arrayDecodedInvites?.length == 0) return res.status(400).json({invitesExpired:true})
//   // console.log('Array of pet ID arrays: ', arrayDecodedInvites)
//   // Parse the invite to capture the pet IDs being shared
//   try {
//     const petInfo = await getArrayPetInfoArrays(req.arrayDecodedInvites)    
//     req.petInfo = petInfo 
//   } catch (error) {
//     console.log('Error getting pet info: ', error)
//     return res.status(400).json({queryError:`Error querying for pet info: ${error}`})
//   }
//   // console.log('Pet Info returned: ', petInfo)
//   console.log('Pet info successfully processed.')
//   return res.status(200).json(req.petInfo)
// })

router.get('/verifyInvite', async(req,res) => {
  const ownerId = req.ownerId
  const invitationSecret = process.env.INVITATION_SECRET

  // const filterPendingInvitationTokens = async(invitationIdArray) => {
  //   const promiseArray = invitationIdArray.map( async(invitationId) => {
  //       try{
  //           const result = await queries.isPending(invitationId)
  //           return result //Will return TOKEN and not ID
  //       }catch(err){
  //           console.log(`Error querying for invitation id: ${invitationId}:`, err)
  //           return null
  //       }
  //   })
  //   const promiseResult = await Promise.allSettled(promiseArray) // [ {status:'',value: VALUE ]
  //   const promiseValues = promiseResult.map( promise => {
  //     return promise.value
  //   })
  //   const pendingInvitationTokens = promiseValues.filter( value => value != null)
  //   return pendingInvitationTokens
  // } // Returns pending tokens

  const verifyPendingInvites = async(pendingInvitationTokens) => {
    const verifiedInvitePromises = pendingInvitationTokens.map( async(invitationToken) => {
      try {
        const decodedInvitation = jwt.verify(invitationToken.invitationToken, invitationSecret )
        const { sendingOwnerId, petIdsArray } = decodedInvitation
        const sendingOwnerUsername = await queries.getUsername(sendingOwnerId)
        return { sendingOwnerUsername, petIdsArray, invitationId: invitationToken.invitationId }
      } catch (error) {
        console.log('Error processing invitation. Attempting to set expired to true. Error: ', error)
        if(error.name == 'TokenExpiredError'){
          try {
            await queries.setInviteExpiredByToken(invitationToken.invitationToken)
            console.log('Successfully set invitation token to expired.')         
          } catch (error) {
            console.log('Error setting invitation to EXPIRED.')
            return null
          }
        }
        return null
      }
    })
    const verifiedInviteResults = await Promise.allSettled(verifiedInvitePromises)
    const verifiedInviteValues = verifiedInviteResults.map( verifiedInvite => verifiedInvite.value)
    const verifiedInvites = verifiedInviteValues.filter( value => value != null )

    return verifiedInvites
  } // Verifies token validity and returns { sendingOwnerUsername, petIdArray }

  const processPetIds = async(petIdsArray) => {
    const petDataPromises = petIdsArray.map( async( petId ) => {
      try {
        const result = await queries.getPetInfo(petId)
        console.log('Result from getting pet info: ', result)
        if(result.rowCount == 0) throw new Error('Pet info not found')
        return result.rows[0]
      } catch (error) {
        console.log(`Error getting pet Info for petId ${petId}: `, error)
        return null
      }
    })

    const petDataResults = await Promise.allSettled(petDataPromises)
    const petDataValues = petDataResults.map( petInfoResult => petInfoResult.value)
    const petData = petDataValues.filter( petDataValues => petDataValues != null )
    return petData

      // Values returned are non-null
  }

  const getPetDataByInvitation = async(decodedInvitationTokens) => {
    const petDataPromise = decodedInvitationTokens.map( async(decodedInvitationToken) => {
      console.log('Decoded invitation token: ', decodedInvitationToken)
      const { petIdsArray,sendingOwnerUsername, invitationId } = decodedInvitationToken
      try {
        const petData = await processPetIds(petIdsArray)
        return {sendingOwnerUsername,petData, invitationId}
      } catch (error) {
        throw error
      } 
    })

    const petDataResults = await Promise.allSettled(petDataPromise)
    console.log('Pet data results: ', petDataResults)
    const petDataValues = petDataResults.map( result => result.value )
    const petDataByInvitation = petDataValues.filter( petDataResult => petDataResult.petData.length > 0 )
    return petDataByInvitation

  }

  // const getArrayPetIdArrays = async(invitationsArray) => {
  //   const promiseArray = invitationsArray.map( async(inviteObj)=> {
  //     const invite = inviteObj.invitation_token
  //     try {
  //       const decodeInvite = jwt.verify(invite,invitationSecret)
  //       const petIdArray = decodeInvite.petIdArray
  //       const sendingOwnerId = decodeInvite.sendingOwnerId
  //       const sendingOwnerUsername = await queries.getUsername(sendingOwnerId)
  //       const inviteId = await queries.getInvitationId(invite)
  //       return { inviteId, sendingOwnerUsername, petIdArray }
  //     } catch (error) {
  //       console.log('Error decoding invitation: ', error)
  //       try{
  //         await queries.setInviteExpiredByToken(invite) 
  //       }catch(error){
  //         console.log('Error setting token as expired: ', error)
  //         return 
  //       }
  //       return null
  //     }
  //   })
  //   try {
  //     const arrayPetIdArrays = await Promise.allSettled(promiseArray)
  //     const filteredArrayPetIdArrays = arrayPetIdArrays?.filter( petIdArray => petIdArray.value != null)
  //     const arrayPetIdArrayValues = filteredArrayPetIdArrays.map( nonNullPetIdAray => nonNullPetIdAray.value)
  //     return arrayPetIdArrayValues 
  //   } catch (error) {
  //     console.log('Error processing invitations: ', error)
  //   }
  // }

  // const getArrayPetInfoArrays = async(arrayDecodedJWT) => {
  //   // console.log('array of decoded JWT: ', arrayDecodedJWT)
  //   // const sendingOwnerId = arrayDecodedJWT.sendingOwnerId
  //   // const petIdArray = arrayDecodedJWT.petIdArray
  //   const promiseArray = arrayDecodedJWT.map( async(decodedInvite) => {
  //     const petIdArray = decodedInvite.petIdArray
  //     const sendingOwnerUsername = decodedInvite.sendingOwnerUsername
  //     const inviteId = decodedInvite.inviteId
  //     try {
  //       const petInfo = await processPetIds(petIdArray)
  //       return {inviteId, sendingOwnerUsername, petInfo}
  //     } catch (error) {
  //       throw error
  //     }
  //   })

  //   try {
  //     const petInfo = await Promise.allSettled(promiseArray)  
  //     const valuesPetInfo = petInfo.map( petInfoPromiseResult => {
  //       // console.log('Pet info promise result: ', petInfoPromiseResult)
  //       const promisesArray = petInfoPromiseResult.value 
  //       // console.log('Promise array: ', promisesArray)
  //       // const infoArray = promisesArray.map( promise => promise.value)
  //       // console.log('Info array: ', infoArray)
  //       return promisesArray
  //     })
  //     // console.log('Values from pet info promises returned: ', valuesPetInfo)

  //     return valuesPetInfo    
  //   } catch (error) {
  //     throw error
  //   }

  // }

  try {
    const invitationTokens = await queries.getPendingInvitationTokens(ownerId)
    // console.log('Invitation Tokens received from the backend: ', invitationTokens)
    req.invitationTokens = invitationTokens
  } catch (error) {
    console.log('Error querying for invites: ', error)
    return res.status(400).json({queryError:`Error querying for invites: ${error}`})
  }

  if(req.invitationTokens?.length == 0) return res.status(200).json({ emptyInvitations:true })

  const invitationTokens = [...req.invitationTokens]

  try {
    // const invitationTokensJwt = invitationTokens.map(invitationTokenObject => invitationTokenObject.invitationToken)
    const verifiedInvites = await verifyPendingInvites(invitationTokens)
    req.verifiedInvites = verifiedInvites
  } catch (error) {
    console.log('Error querying for pet Ids: ', error)
    return res.status(400).json({queryError:`Error querying for pet Ids: ${error}`})
  }

  if(req.verifiedInvites?.length == 0) return res.status(400).json({emptyInvitations: true })

    // Parse the invite to capture the pet IDs being shared
  try {
    const invitationData = await getPetDataByInvitation(req.verifiedInvites)
    console.log('Invitation data: ',invitationData)    
    req.invitationData = invitationData 
  } catch (error) {
    console.log('Error getting pet info: ', error)
    return res.status(400).json({queryError:`Error querying for pet info: ${error}`})
  }
  // console.log('Pet Info returned: ', petInfo)
  console.log('Pet info successfully processed.')
  return res.status(200).json(req.invitationData)
})
  
router.post('/acceptInvitation', async(req,res) => {
  console.log('An attempt to accept an invite has been recieved')
  const ownerId = req.ownerId
  const invitationSecret = process.env.INVITATION_SECRET
  const invitationId = req.body.invitationId

  if(!ownerId || !invitationId) {
    return res.status(400).json({ error: 'Missing critical info' })
  }

  try {
    console.log('Invitation id: ', invitationId)
    console.log('OwnerId: ', ownerId)
    const invitationToken = await queries.confirmLinkedAndPendingInvitation(invitationId,ownerId)
    console.log('invitationToken found: ', invitationToken)
    req.invitationToken = invitationToken
    if(!invitationToken) throw new Error('A pending token and owner are not linked.')
  } catch (error) {
    console.log('Error validating if the owner is linked to this token: ', error)
    return res.status(400).json({ error, invitationId, updated: false })
  }


  try {
    const decodedInvitationToken = jwt.verify(req.invitationToken, invitationSecret)
    const { sendingOwnerId, petIdsArray } = decodedInvitationToken
    req.sendingOwnerId = sendingOwnerId
    req.petIdsArray = petIdsArray
  } catch (error) {
    if(error.name == 'TokenExpiredError'){
      try {
        const result = await queries.setInviteExpiredByToken(req.invitationToken)
      } catch (error) {
        console.log('Error setting invitation token as expired: ', error)
      }
    }
    return res.status(400).json({ error, invitationId, updated: false })
  }

  try {
    const sendingOwnerUsername = await queries.getUsername(req.sendingOwnerId)
    req.sendingOwnerUsername = sendingOwnerUsername
  } catch (error) {
    console.log('Error finding an the sender\'s username: ', error)
    return res.status(400).json({ error })
  }

  const processPetIdArray = async(petIds) => {
    const updatePromiseArray = petIds.map( async(petId) => {

      try {
        const result = await queries.checkExistingLink(petId,ownerId)
        if(result) throw new Error('Link between this owner and pet already exists.')
      } catch (error) {
        if(error.message == 'Link between this owner and pet already exists.'){
          console.log('Link between owner and pet exist ')
          return { petId, linked: true }  
        }
        console.log('Error checking for an existing link between owner and pet: ', error)
        return { petId, linked: false }
      }

      try {
        const result = await queries.addPetOwnerLink(petId, ownerId)
        const petName = result.pet_name
        return { petName, linked: true }
      } catch (error) {
        console.log('Error linking pet and owner: ', error)
        return { petId, linked: false }
      }
    })

    const updatePromiseResult = await Promise.allSettled(updatePromiseArray)
    const updatePromiseValues = updatePromiseResult.map( promise => promise.value )
    return updatePromiseValues
 
  }

  try {
    const processedPetIdArray = await processPetIdArray(req.petIdsArray)   
    req.processPetIdArray = processedPetIdArray 
  } catch (error) {
    console.log('Error processing pet Id Array: ', error)
    return res.status(400).json({ error })
  }

  try {
    await queries.setInviteTokenAccepted(invitationId)
  } catch (error) {
    console.log('Error accepting invitation token: ', error)
  }

  const processedInvitation = { invitationId, invitationResult:req.processedPetIdArray, sendingOwnerUsername: req.sendingOwnerUsername }
  return res.status(200).json( processedInvitation )
})

// router.post('/acceptInvitation', async(req,res) => {

//   const invitationId = req.body.invitationId
//   const ownerId = req.ownerId
//   const invitationSecret = process.env.INVITATION_SECRET

//   const processedPromiseArray = async(invitationArray) => {
//     const promiseArray = invitationArray.map( async(invitationId) => {
//       try {
//         await queries.checkInviteLink(invitationId,ownerId)
//       } catch (error) {
//         console.log('Error querying invitation id in owner table: ', error)
//         return { invitationId, updated: false }
//       }
    
//       try {
//         await queries.checkInvitePending(invitationId)
//       } catch (error) {
//         console.log('Error with invite validity: ', error)
//         return { invitationId, updated: false }
//       }
    
//       try {
//         const invitationToken = await queries.getInvitationToken(invitationId)
//         req.invitationToken = invitationToken
//       } catch (error) {
//         console.log('Error locating invite: ', error)
//         return { invitationId, updated: false }
//       }
    
//       try {
//         const decodedInvite = jwt.verify(req.invitationToken, invitationSecret)
//         req.petIdArray = decodedInvite.petIdArray
//       } catch (error) {
//         console.log('Error decoding the invite token: ', error)
//         // try {
//         //   await queries.removeIerrornvitationById(invitationId, ownerId) // NEED TO CREATE QUERY
//         // } catch (error) {
//         //   console.log('Error attempting to remove invitation ID from owner in owners table: ', error)
//         // }
//         return { invitationId, updated: false }
//       }
    
//       const getLinkStatusArray = async(petIdsArray) => {
//         const promiseArray = petIdsArray.map( async(petId) => {
//           try {
//             const result = await queries.checkExistingLink(petId,ownerId)
//             return {petId,link:result.link, new:result.new}
//           } catch (error) {
//             console.log(`Error querying owner link for pet id ${petId} and owner id ${ownerId}: `, error)
//             return {petId,link:null, new:null}
//           }
//         })
    
//         try {
//           const linkStatusResolvedPromiseArray = await Promise.allSettled(promiseArray)
//           // returns [ {'status':fufilled, value: { petId,link }} ]
//           const linkStatusArray = linkStatusResolvedPromiseArray.map( promise => {
//             return promise.value
//           })
//           return linkStatusArray
//         } catch (error) {
//           console.log('Error resolving link status promise: ', error)
//           return new Error()
//         }
//       }
    
//       const updateLinkStatus = async(linkStatusArray) => {
//         // linkStatusArray: [ { petId: number, link: boolean  }]
//         const promiseArray = linkStatusArray.map( async(linkStatus) => {
//           if(!linkStatus.link){
//             if(linkStatus.new){
//               try {
//                 await queries.addPetOwnerLink(linkStatus.petId, ownerId)
//                 return { petId: linkStatus.petId, updated: true } 
//               } catch (error) {
//                 console.log(`Error updating link for ${linkStatus.petId}: `, error)
//                 return { petId: linkStatus.petId, updated: false}
//               }
//             }else{
//               try {
//                 await queries.updateLinkStatus(linkStatus.petId, ownerId)
//                 return { petId: linkStatus.petId, updated: true } 
//               } catch (error) {
//                 console.log(`Error updating link for ${linkStatus.petId}: `, error)
//                 return { petId: linkStatus.petId, updated: false}
//               }
//             }
//           }else{
//             return { petId: linkStatus.petId, updated: false}
//           }
//         })
//         try{
//           const updatedLinksPromiseResultArray = await Promise.allSettled(promiseArray)
//           const updatedLinksArray = updatedLinksPromiseResultArray.map( updatedLinksPromiseResult => updatedLinksPromiseResult.value )
//           return updatedLinksArray
//         }catch(error){
//           console.log('Error updating link status: ', error)
//         }
//       }
    
//       try {
//         const linkStatusArray = await getLinkStatusArray(req.petIdArray)
//         req.linkStatusArray = linkStatusArray
//       } catch (error) {
//         console.log('Error getting link status array: ', error)
//       //   return res.status(400).json({error:'Error processing accepting invite'})
//       }
    
//       try {
//         const linkStatusArray = req.linkStatusArray
//         const updatedLinks = await updateLinkStatus(linkStatusArray)
//         req.updatedLinks = updatedLinks 
//       } catch (error) {
//         console.log('Error updating status links: ', error)
        
//       }
    
//       try {
//         await queries.setInviteTokenAccepted(invitationId)
//       } catch (error) {
//         console.log('Error attempting to invalidate invite token: ', error)
//       }
      
//       if(req.updatedLinks) return res.status(200).json(req.updatedLinks)
//       else return res.status(400).json({ error: 'Error updating links' })
        
//     })

//     try {
//       const settledPromises = await Promise.allSettled(promiseArray)
//       const nonNullValues = settledPromises.filter( settledPromise => {
//         return settledPromise.value != null
//       })
//       const updatedInvites = nonNullValues.map( promise =>  {
//         return promise.value
//       })
//       return updatedInvites
//     } catch (error) {
//       console.log('Error processing accepted invites: ', error)
//       return null
//     }
//   } 
    
//   try {
//     const updatedInviteArray = await processedPromiseArray(invitationIdArray)
//     if(updatedInviteArray == null) throw new Error('Processing accepted invites returned null.')
//     return res.status(200).json(updatedInviteArray)
//   } catch (error) {
//     console.log("Error updating invitations: ", error)
//     return res.status(400).json({error : 'Error attemting to accept invites.'})
//   }
  
// }) 

router.post('/rejectInvite', async(req,res) => { 
  console.log('An attempt to reject an invite was recieved.')
  // Remove invite from owner table, need owner id, need invite token
  const ownerId = req.ownerId
  // const ownerId = req.body.ownerId
  const inviteId = req.body.invitationId
  if(!ownerId || !inviteId) {
    return res.status(400).json({ error: 'Missing critical info' })
  }

  try {
    const invitationToken = await queries.confirmLinkedAndPendingInvitation(inviteId,ownerId)
    // req.invitationToken = invitationToken
    if(!invitationToken) throw new Error('A pending token and owner are not linked.')
  } catch (error) {
    console.log('Error validating if the owner is linked to this token: ', error)
    return res.status(400).json({ error, inviteId, updated: false })
  }

  // Update invite in invite table so rejected is true
  try {
    await queries.rejectInvitation(inviteId)
    return res.status(200).json({success: 'Rejected invitation'})
  } catch (error) {
    console.log('Error rejecting invitation: ', error)
    return res.status(400).json({ error:'Failed to update invitation to \'rejected\' ' })
  }
  
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
router.post('/sendInvite', async(req,res) => {
  // Capture owner id from request
  const sendingOwnerId = req.ownerId
  // Capture the invitee's email
  const invitedEmail = req.body.email
  // Capture the pet(s) IDs that are being shared
  const petIdsArray = req.body.petsToShareArray 
  console.log('Pet ID array:', petIdsArray)

  if(!sendingOwnerId || !invitedEmail || !petIdsArray) return res.status(400).json({message: new Error('Missing critical info to send invite')})

  /* LOGIC */
  // Confirm active link between the sender and pet id(s) included in req.body
  try {
    const activePetLinks = await queries.getOwnersPetIds(sendingOwnerId)
    const activePetLinkIds = activePetLinks.map( petData => petData.id )
    console.log('Active Pet Links: ', activePetLinkIds)
    req.activePetLinkIds = activePetLinkIds
  } catch (error) {
    console.log('Error getting active pet links:', error)
    return res.status(400).json({ error })
  }

  const arrrayComparison = ( comparisonArray, referenceArray ) => {
    const comparisonResultArray = comparisonArray.map( el => {
      const result = referenceArray.includes(el)
      return result
    })
    if(comparisonResultArray.includes(false)) return false
    else return true
  }
  const parsedPetIdsArray = petIdsArray.map( id => parseInt(id) )    
  const validPetLinks = arrrayComparison(parsedPetIdsArray,req.activePetLinkIds)
  if(!validPetLinks) return res.status(400).json({ error: 'This invitation is trying to send pets not linked to this account.' })

  // try{
  //   const isPetOwnerLinkActive = await queries.checkOwnerLink(sendingOwnerId, petIdsArray)
  // }catch(e){
  //   console.log('Error checking for active links between pet and owners: ', e )
  //   return res.status(400).json({ message: 'One or more of the pets being shared is not linked to your account'})
  // }

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