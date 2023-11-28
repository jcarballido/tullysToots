import express from 'express'
import dotenv from 'dotenv/config'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

app.use(cors())
app.use(express.json())

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
    const resetSecret = process.env.RESET_SECRETS
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


// DATABASE QUERIES
// QUERY Module to enter into DB ('petQueries')
import { Pool } from 'pg'
// Double-check .env variables to match postgres defaults
const pool = new Pool()
// Enter a new log of activity
const newActivityText = `INSERT INTO table_name (date, time, urine, poo) VALUES (val1, val2, ...)`
const newActivity = async(date,time,meridiem,urine,poo,petId) => {
  const result = await pool.query(newLogText)
}

/*
TABLE: activity
DATE | TIME | URINE | POO | PET_ID | USER_ID
TABLE: user
EMAIL | PASSWORD | PET_ID | REFRESH_TOKEN
TABLE: reset
USER_ID | RESET_TOKEN | ACCESSED_AT
TABLE: pet
PET_ID | PET_NAME
*/