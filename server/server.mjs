import express from 'express'
import dotenv from 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import queries from './queries/queries.mjs'

const app = express()

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

//app.use(cors())
app.use(express.json())

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

/* DELETE BEOW THIS LINE_____________________________
// const confirmIdsExist = (requestedPetIds,linkedPetIds) => {
//   const result = requestedPetIds.every(id => linkedPetIds.includes(id))
//   return result
// }

// const script = (async() => {
//   // const invitationSecret = process.env.INVITATION_SECRET
//   // const sendingOwnerId = await queries.getOwnerId('email5@gmail.com')
//   // const receivingOwnerId = await queries.getOwnerId('email2@email.com')
//   // console.log('Sender => ', sendingOwnerId)
//   // console.log('Receiver => ',receivingOwnerId)
//   // if(!sendingOwnerId) return console.log('We cannot find an account associated with your email')
  
//   //const verifiedLinkedPetIds = await queries.getOwnersPetIds( sendingOwnerId )
//   // console.log('Verified linked pet ids: ', verifiedLinkedPetIds)
//   // const verifiedIdsExist = confirmIdsExist([11],verifiedLinkedPetIds)
//   // if(!verifiedIdsExist) return console.log('Can\'t find a link to one or more of these pets')
//   if(receivingOwnerId){
//     const payload = {
//       sendingOwnerId, 
//       receivingOwnerId, 
//       newPetIdsArray:[11,13]
//     }
//     // 2. Create a JWT where the payload is { userId: userID from query}, and the JWT is named 'resetToken', and an expiration of 10 minutes.
   
//     const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })
//     // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
    
//     try{
//       await queries.addInvitationLink(sendingOwnerId,invitationToken)
//       // 4. Create a link that contains this JWT in the URL.
//       const addPetOwnerLink = `http://localhost:3000/acceptInvite?invitationToken=${invitationToken}`
//       // 5. Send this link via an email to the user's registered email (confirmed in Line 25)
//       // const info = await transporter.sendMail({
//       //   from: companyEmail, // sender address
//       //   to: receivingOwnerEmail, // list of receivers
//       //   subject: "A Tully's Toots Member is Inviting You!", // Subject line
//       //   html: resetForm(addPetOwnerLink), // html body
//       // });
//       // console.log('Line 101 => ', info)
//       return console.log('Link sent: ', addPetOwnerLink)
//     }catch(e){
//       return console.log(e)
//     }
//   }else{
//     const payload = {
//       sendingOwnerId, 
//       newPetIdsArray:[11,13]
//     }
//     const invitationSecret = process.env.INVITATION_SECRET
//     const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })
//     // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
//     // NEED TO CHECK FOR ERRORS ADDING ROW IN SQL, EMAIL WILL SEND REGARDLESS
//     try{
//       await queries.addInvitationLink(sendingOwnerId, invitationToken)
//       // 4. Create a link that contains this JWT in the URL.
//       const addPetOwnerLink = `http://localhost:3000/acceptInvite?invitationToken=${invitationToken}`
//       // 5. Send this link via an email to the user's registered email (confirmed in Line 25)
//       // const info = await transporter.sendMail({
//       //   from: companyEmail, // sender address
//       //   to: receivingOwnerEmail, // list of receivers
//       //   subject: "A Tully's Toots Member is Inviting You!", // Subject line
//       //   html: resetForm(addPetOwnerLink), // html body
//       // });
//       //console.log('Line 101 => ', info)
//       return console.log('Link sent: ', addPetOwnerLink)
//     }catch(e){
//       return console.log(e)
//     }
//   }
// })()
DELETE ABOVE THIS LINE________________ */

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
  if(receivingOwnerId){
    const payload = {
      sendingOwnerId, 
      receivingOwnerId, 
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
  }else{
    const payload = {
      sendingOwnerId, 
      newPetIdsArray
    }
    const invitationToken = jwt.sign(payload, invitationSecret,{ expiresIn:'1d' })
    // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
    //console.log('sendingOwnerId: ',sendingOwnerId)
    // NEED TO CHECK FOR ERRORS ADDING ROW IN SQL, EMAIL WILL SEND REGARDLESS
    try{
      await queries.addInvitationLink(sendingOwnerId, invitationToken)
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
  
})

const exisitingUserHtmlContent = `
  <html>
    <head>
      <title>Someone Shared a Link with You!</title>
    </head>
    <body>
      <form action="http://localhost:3000/createAccountAndLink" method="post">
        <div>EXISTING USER<div>
        <label for="inputValue">Enter a value:</label>
        <input type="text" id="inputValue" name="inputValue" required>

        <!-- Submit button -->
        <button type="submit">Submit</button>
      </form>
    </body>
  </html>
`
const newUserHtmlContent = `
  <html>
    <head>
      <title></title>
    </head>
    <body>
      <form action="http://localhost:3000/createAccountAndLink" method="post">
        <div>NEW USER<div>
        <label for="inputValue">Enter a value:</label>
        <input type="text" id="inputValue" name="inputValue" required>

        <!-- Submit button -->
        <button type="submit">Submit</button>
      </form>
    </body>
  </html>
`

app.get('/acceptInvite', async(req,res) => {
  // Check if link has been accessed before.
  const invitationToken = req.query.invitationToken
  const invitationSecret = process.env.INVITATION_SECRET
  const mint = await queries.getLastAccessedTimestamp(invitationToken)
  console.log('Invitation token is mint? ',mint)
  // If token has been accessed (i.e., not 'mint'), reject this request by sending error.
  if(!mint) return res.json({error: new Error('Link has been used')})
  // CHECK IF INVITED USER IS NEW OR REGISTERED
  const expectedReceivingOwnerId = await query.getOwnerIdFromInvite(invitationToken)
  if(!expectedReceivingOwnerId){
    // Redirect to sign-UP page along with invitation token
    return res.redirect(`http://localhost:3001/sign-up?invitationToken=${invitationToken}`)
  }else{
    // Check the client attempting to accept the invite matches with the intended invite recipient
    const payload = jwt.verify(invitationToken, invitationSecret)
    // Return error: Either expired token or tampered with
    if(payload instanceof Error){
      return res.json({error: new Error('Invalid link')})
    }
    console.log('Token is valid; payload: ', payload)
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
    if(!result) return res.send('server, line 301 => Error adding timestamp')
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

// MIDDLEWARE for ACCOUNT HANDLING w AUTHORIZATION

app.post('/sign-in', async(req,res) => {
  // Extract email and password from req.body 
  const { email, password } = req.body
  // Confirm user is registered; NEED TO CREATE UserQueries SERVICE
  const user = await queries.authorizeUser(email,password)
  // If exists:
  // Check password
  const passwordMatch = bcrypt.compare(password, user.password)
  // If passwords match:
  const accessSecret = process.env.ACCESS_SECRET
  const refreshSecret = process.env.REFRESH_SECRET
  // Create access token
  const accessToken = jwt.sign({ user: user.email }, accessSecret, {expiresIn: '15m'})
  // Create refresh token 
  const refreshToken = jwt.sign({user:user.email}, refreshSecret, { expiresIn:'10d'})
  // Set refresh token cookie
  const refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 10 // ms/s * s/min * min/hr * hrs/day * num. days
  res.cookie('refreshToken',refreshToken,{ maxAge: 1000 * 60 * 60 * 24 * 10, httpOnly:true})
  const invitationToken = req.query.invitationToken
  if(invitationToken){
    const receivingOwnerId = await queries.getOwnerId(email)
    const result = await query.addReceivingOwnerIdToInvitation(receivingOwnerId)
    // Send access token
    return res.json({accessToken,invitationToken})
  }else{
    // Send access token
    return res.json({accessToken})
  }
})

app.post('/sign-up', async(req,res) => {
  // Extract email and password from req.body
  const { email, password } = req.body
  // Validate
  // Confirm email is unique
  const userExists = await queries.userExists(email)
  // If userExists returns false...
  // Create refresh token...
  const refreshSecret = process.env.REFRESH_SECRET
  const refreshToken = jwt.sign({user:email}, refreshSecret, { expiresIn:'10d' })
  // Create access token 
  const accessSecret = process.env.ACCESS_SECRET
  const accessToken = jwt.sign({ user:email }, accessSecret, { expiresIn:'15m' })
  // Hash raw password
  const saltRounds = 5
  bcrypt.hash(password, saltRounds, async(err,enc) => {
    //store user in DB
    const result = await queries.saveUser(email,enc,refreshToken)
  })
  res.cookie('refreshToken',refreshToken,{ maxAge: 1000 * 60 * 60 * 24 * 10, httpOnly:true})
  const invitationToken = req.query.invitationToken
  if(invitationToken){
    const receivingOwnerId = await queries.getOwnerId(email)
    const result = await query.addReceivingOwnerIdToInvitation(receivingOwnerId)
    // Send access and invitation token
    return res.json({accessToken,invitationToken})
  }else{
    // Send access token
    return res.json({accessToken})
  }
})

// BEGIN UN-COMMENTING ***BELOW*** THIS LINE
// ------------------------------------------------
/*

const resetForm = (link) => {
  return `
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>HTML Form</title>
  </head>
  <body>
      <h1>Password Reset Request</h1>
      <h3>IF YOU DID NOT MAKE THIS REQEUST, PLEASE CONTACT SUPPORT</h3>
      <a href=${link} target="_blank">Click here to reset your password</a>
  </body>
`}

app.post('/resetRequest', async(req,res) => {
  const { userEmail } = req.body
  console.log('Line 79 => ', userEmail)
  // 1. FInd user ID from email
  const userId = await userQueries.getUserId(userEmail);
  if(userId){
    // 2. Create a JWT where the payload is { userId: userID from query}, and the JWT is named 'resetToken', and an expiration of 10 minutes.
    const resetSecret = process.env.RESET_SECRET
    const resetToken = jwt.sign({ userId }, resetSecret,{ expiresIn:'10m' })
    // 3. Store the userId,resetToken, AccessedAt='null' in a new row in the 'ResetRequest' table. Override existing resetToken.
    await userQueries.resetRequest(userId, resetToken)
    // 4. Create a link that contains this JWT in the URL.
    const resetLink = `http://localhost:3000/resetPassword?resetToken=${resetToken}`
    // 5. Send this link via an email to the user's registered email (confirmed in Line 25)
    const info = await transporter.sendMail({
      from: user, // sender address
      to: userEmail, // list of receivers
      subject: "Tully's Toots Password Reset", // Subject line
      html: resetForm(resetLink), // html body
    });
    console.log('Line 101 => ', info)
  }else{
    console.log('User does not exist')
  }
})

app.get('/resetPassword', async(req,res) => {
  // Get reset token from request body
  const resetToken = req.query.resetToken
  const resetSecret = process.env.RESET_SECRETS
  // Validate token to get the userID, ensuring the token is valid and not expired.
  const payload = jwt.verify(resetToken, resetSecret)
  if(payload instanceof Error){
    return res.json({error: new Error('Invalid link')})
  } 
  console.log('Token is valid; payload: ', payload)
  // Query the 'ResetRequest' table to confirm the the 'AccessToken' is null and that the token's match. If not, display that the link expired and a new link needs to be requested. Finally, remove the token from the record since it's considered 'no good'.
  // If so, enter a timestamp under AccessedAt: column. 
  const mint = resetQueries.assessTokense(resetToken)
  if(!mint){
    return res.json({error: new Error('Link has been used')})
  }
  return res.json({resetToken})
  // Send an HTML form to the client for the user to reset their password.
  // const htmlContent = `
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
  // // Set the content type to text/html
  // res.setHeader('Content-Type', 'text/html');
  // // Send the HTML as the response
  // res.send(htmlContent);

})

app.post('/resetPasswordConfirmation', async(req,res) => {
  // Get new password from request body
  // Confirm both inputs match
  const newPassword = req.body.inputValue1
  const confirmPassword = req.body.inputValue2
  if(newPassword != confirmPassword){
    return res.send('Password do not match')
  }
  // Update password in db 
  const result = await userQuery.updatePassword(confirmPassword)
  if(result){
    res.send('Successfuly changed password.')
  }else{
    res.send('Error saving new password')
  }
})

//MIDDLEWARE for LOGGING and UPDATING

app.use(verifyJwt)
app.post('/activity', async(req,res) => {
  // Extract activity from req.body
  const { newEntry, date, time, meridiem, urine, poo } = req.body
  // Extract access token
  const { accessToken } = req.headers['authorization'].split(' ')[1]
  // Extract userId and petId from payload
  const payload = jwt.verify(accessToken)
  const { userId,petId } = payload
  if(newEntry){
    const result = await petQueries.newLog(newEntry,date,time,meridiem,urine,poo,userId,petId)
    if(result){
      res.send('Successully added')
    }else{
    res.send(new Error('Error logging habits'))}
  }else{
    const result = await petQueries.updateLog(date,time,meridiem,urine,poo,userId,petId)
    if(result){
      res.send('Successfully updated')
    }else{
      res.send(new Error('Error logging habits'))
    }
  }
})

// MIDDLEWARE for GETTING DATA

// ENDPOINT Module to get recent activity
// Only need a week of data at first
// Will load more as user scrolls through data
app.post('/main', async(req,res) => {
  // extract userId and petId   
  const { accessToken } = req.headers['authorization'].split(' ')[1]
  // Extract userId and petId from payload
  const payload = jwt.verify(accessToken,'secret')
  const { userId,petId } = payload
  const recentActivity = await petQueries.getRecentActivity(userId,petId)
  return res.json({activity: recentActivity})
})

// ENDPOINT Module that will pull in more activity history
app.post('/history', async(req,res) => {
  // Extract the earliest data available to UI and use it to send even earlier data
  const { earliestDate } = req.body
  const result = await petQueries.getEarlierActivity(userId,petId,earliestDate)
  return res.json({ earlierActivity : result })
})
*/
// ------------------------------------------------
// BEGIN UN-COMMENTING ***ABOVE*** THIS LINE




// IGNORE EVERYTHING BELOW THIS LINE
//-----------------------------------
// DATABASE QUERIES
// QUERY Module to enter into DB ('petQueries')
// import { Pool } from 'pg'
// // Double-check .env variables to match postgres defaults
// const pool = new Pool()
// // Enter a new log of activity
// const newActivityText = `INSERT INTO table_name (date, time, urine, poo) VALUES (val1, val2, ...)`
// const newActivity = async(date,time,meridiem,urine,poo,petId) => {
//   const result = await pool.query(newLogText)
// }