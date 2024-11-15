import express from 'express'
import dotenv from 'dotenv/config'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import queries from './queries/queries.mjs'
import accountRouter from './routes/accountRouter.mjs'
import activityRouter from './routes/activityRouter.mjs'

const app = express()

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

app.use(cors({ credentials: true, origin: 'https://tullystoots-1.onrender.com'} ))
// app.use(cors({ credentials: true, origin: 'http://localhost:3001'} ))

app.use(express.json())


app.use('/account',accountRouter)
app.use('/activity',activityRouter)

/*
*** DELETE CODE ABOVE THIS LINE ***
app.post('/testAddOwner', async(req,res) => {
  const result = await queries.addOwner(req.body.ownerData)
  res.json({result})
})

app.post('/getOwnerId', async(req,res) => {
  console.log(req.body.ownerData)
  const result = await queries.getOwnerId(req.body.ownerData.email)
  res.json({result})
})

app.post('/testAddPet', async(req,res) => {
  console.log(req.body.ownerAndPetData)
  const data = req.body.ownerAndPetData
  const result = await queries.addPet(data)
  res.json({result})
})

app.post('/testUpdateOwnerData', async(req,res) => {
  const updatedData = req.body.updatedData
  const result = await queries.updateOwner(updatedData)
  res.json({result})
})

const companyEmail = `"Tully's Toots" <${process.env.APP_USERNAME}>`
const companyEmailPassword = process.env.APP_PASSWORD
console.log('Line 44, server.mjs => ', companyEmail)
console.log('Line 45, server.mjs => ', companyEmailPassword)

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: process.env.APP_USERNAME,
    pass: companyEmailPassword,
  },
});

const resetForm = (link) => {
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

app.post('/sendInvite', async(req, res) => {
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



app.get('/invitation', async(req,res) => {
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
})

app.post('/acceptInvite', async(req,res) => {
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

// MIDDLEWARE for ACCOUNT HANDLING w AUTHORIZATION

app.post('/sign-in', async(req,res) => {
  // Extract email and password from req.body 
  const { email, password } = req.body
  // Confirm user is registered; NEED TO CREATE UserQueries SERVICE\
  const ownerId = await queries.getOwnerId(email)
  if(!ownerId) return res.send('User does not exist')
  const passwordHash = await queries.getPasswordHash(ownerId)
  //const user = await queries.authorizeUser(email,password)
  // Check password
  const passwordMatch = bcrypt.compare(password, passwordHash)
  // If passwords match:
  if(passwordMatch){
    const accessSecret = process.env.ACCESS_SECRET
    const refreshSecret = process.env.REFRESH_SECRET
    // Create access token
    const accessToken = jwt.sign({ owner: ownerId }, accessSecret, {expiresIn: '15m'})
    // Create refresh token 
    const refreshToken = jwt.sign({ owner: ownerId }, refreshSecret, { expiresIn:'14d'})
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

app.post('/sign-up', async(req,res) => {
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
    try{
      await queries.addOwner(email,passwordHash,refreshToken)
    }catch(e){
      return res.send('ERROR: Could not save info')
    }
    if(err) return res.send(err)
  })
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
*** DELETE CODE ABOVE THIS LINE ***
*/