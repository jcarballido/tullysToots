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
console.log('Line 10 => ', companyEmail)
console.log('Line 11 => ', companyEmailPassword)

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
  const { sendingOwnerEmail, receivingOwnerEmail } = req.body
  console.log('Line 43 => ', sendingOwnerEmail)
  console.log('Line 44 => ', receivingOwnerEmail)
  // 1. Find sending user ID from email
  const sendingOwnerId = await queries.getOwnerId(sendingOwnerEmail);

  const receivingOwnerId = await queries.getOwnerId(receivingOwnerEmail);

  // Also, confirm if pet-owner links already exist

  if(receivingOwnerId){
    // 2. Create a JWT where the payload is { userId: userID from query}, and the JWT is named 'resetToken', and an expiration of 10 minutes.
    const invitationSecret = process.env.INVITATION_SECRET
    const invitationToken = jwt.sign({ sendingOwnerId, receivingOwnerId }, invitationSecret,{ expiresIn:'1d' })
    // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
    
    try{
      const result = await queries.addInvitationLink(sendingOwnerId, receivingOwnerId,invitationToken)
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
    const invitationSecret = process.env.INVITATION_SECRET
    const invitationToken = jwt.sign({ sendingOwnerId }, invitationSecret,{ expiresIn:'1d' })
    // 3. Store the sending owner_id, receiving owner_id, and invitation token in a new row in the 'invitation_requests' table. Override existing invitation_request.
    console.log('sendingOwnerId: ',sendingOwnerId)
    // NEED TO CHECK FOR ERRORS ADDING ROW IN SQL, EMAIL WILL SEND REGARDLESS
    try{
      const result = await queries.addInvitationLink(sendingOwnerId, invitationToken)
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

app.post('/acceptInvite', async(req,res) => {
  // Get reset token from request body
  const invitationToken = req.query.invitationToken
  const invitationSecret = process.env.INVITATION_SECRET
  // Validate token to get the userID, ensuring the token is valid and not expired.
  const payload = jwt.verify(invitationToken, invitationSecret)
  if(payload instanceof Error){
    return res.json({error: new Error('Invalid link')})
  } 
  console.log('Token is valid; payload: ', payload)
  // Query the 'ResetRequest' table to confirm the 'AccessToken' has been accessed and that the token's match. If not, display that the link expired and a new link needs to be requested. Finally, remove the token from the record since it's considered 'no good'.
  // If so, enter a timestamp under AccessedAt: column.
  const sendingOwnerId = payload.sendingOwnerId
  const match = await queries.compareSavedInvitatonToken(invitationToken,sendingOwnerId) 
  if(!match){
    return res.json({error: new Error('Invite is invalid')})
  }
  const mint = await queries.getLastAccessedTimestamp(invitationToken)
  if(!mint){
    return res.json({error: new Error('Link has been used')})
  }else{
    const htmlContent = `
    <html>
      <head>
        <title>Reset Form</title>
      </head>
      <body>
        <form action="http://localhost:3000/createAccountAndLink" method="post">
      
          <label for="inputValue">Enter a value:</label>
          <input type="text" id="inputValue" name="inputValue" required>
  
          <!-- Submit button -->
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>
  `;
  // Set the content type to text/html
  res.setHeader('Content-Type', 'text/html');
  // Send the HTML as the response
  return res.send(htmlContent);
  }
  // return res.json({resetToken})
  // Send an HTML form to the client for the user to reset their password.
  

})
// BEGIN UN-COMMENTING ***BELOW*** THIS LINE
// ------------------------------------------------
/*
// MIDDLEWARE for ACCOUNT HANDLING w AUTHORIZATION

app.post('/login', async(req,res) => {
  // Extract email and password from req.body 
  const { email, password } = req.body
  // Confirm user is registered; NEED TO CREATE UserQueries SERVICE
  const user = await userQueries.authorizeUser(email,password)
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
  res.cookie('refreshToken',refreshToken, { maxAge: refreshTokenMaxAge, httpOnly:true})
  // Send access token 
  return res.json({ accessToken })
})

app.post('/sign-up', async(req,res) => {
  // Extract email and password from req.body
  const { email, password } = req.body
  // Validate
  // Confirm email is unique
  const userExists = await userQueries.userExists(email)
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
    const result = await userQueries.saveUser(email,enc,refreshToken)
  })
  // Set refresh token cookie
  res.cookie('refreshToken',refreshToken,{ maxAge: 1000 * 60 * 60 * 24 * 10, httpOnly:true})
  // Send access token
  return res.json('accessToken', accessToken)
})

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