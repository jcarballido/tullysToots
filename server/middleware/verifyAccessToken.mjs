import jwt from 'jsonwebtoken'
// Custom Errors
import nullRefreshTokenError from '../errors/nullRefreshTokenError.mjs'
import nullAccessTokenError from '../errors/nullAccesTokenError.mjs'
import nullAdminError from '../errors/nullAdminPrivlidgesError.mjs'
import invalidSignatureError from '../errors/invalidSignatureError.mjs'

// const validateToken = (token,tokenType = 'access') => {
//   const secret = tokenType == 'refresh' ? process.env.REFRESH_SECRET:process.env.ACCESS_SECRET
//   try{
//     const decodedJwt = jwt.verify(token,secret)
//     return decodedJwt
//   }catch(err){
//     return err
//   }
// }

// const checkExpiration = (token) => {
//   const payload = jwt.decode(token)
//   return payload.exp < (Date.now() / 1000) // Date.now() must be converted to seconds 
// }

const verifyAccessToken = (req,res,next) => {
  console.log('VERIFYING ACCESS TOKEN')
  console.log('Check request original URL: ',req.originalUrl)
  const accessToken = req.headers['authorization']
  // console.log('VerifyAcces token middleware. Access Token: ', accessToken)
  if(!accessToken) return res.status(400).json({error: new Error('Missing access token')})
  const accessSecret = process.env.ACCESS_SECRET
  try{
    const decodeJwt = jwt.verify(accessToken, accessSecret)
    // console.log('Decoded JWT: ', decodeJwt)
    const ownerId = decodeJwt.ownerId
    if(!ownerId) return res.status(400).json({ error: new Error('Missing owner ID') })
    req.ownerId = ownerId
    next()
  }catch(e){
    console.log('ERROR VERIFYING: ', e)
    return res.status(400).json({ error: e })
  }

  /*const accessToken = req.headers['authorization']
  // Confirm access token exists. If not, send a custom error.
  if(!accessToken) {
    req.accessTokenNotPresent = true
    return next() 
  }
  // Validate the access token
  const accessTokenPayload = validateToken(accessToken)
  // Check for an error after validation
  if(accessTokenPayload instanceof Error){
    console.log('There is an error with this token. The error is: ', accessTokenPayload)
    // Determine if the access token is expired.
    const expiredAccessToken = checkExpiration(accessToken)
    // If the access token is expired, confirm existence of and valdiate the refresh token.
    if(expiredAccessToken){
      const refreshToken = req.cookies.jwt
      // If a refresh token is not present, send a custom error.
      if(!refreshToken){
        return res.status(401).json({error: new nullRefreshTokenError('Refresh token was not provided; Requires sign-in')}) // Handled by frontend
      }
      console.log('The access token was expired. Checking to see if refresh token is valid...')
      const refreshTokenValidation = validateToken(refreshToken, 'refresh')
      // Return any error given after validation.
      if(refreshTokenValidation instanceof Error){
        const expiredRefreshToken = checkExpiration(refreshToken)
        if(expiredRefreshToken){
          console.log('Refresh token was not valid; expired. Error returned to client.')
          return res.status(401).json({error: new Error('Refresh token is expired; Requires sign-in')}) // Handled by frontend
        }else{
          console.log('Refresh token was not valid; tampered with. Error pushed to error handler in server.')
          return next(new invalidSignatureError('Invalid signature present on refresh token')) // Additional action required
        }
      }
      else req.refToken = refreshToken
      // Trigger the need for a new access token and refresh token.
      
      req.refreshTokenVerification = true
      req.currentRefreshToken = refreshToken
      req.tokenPayload = refreshTokenValidation
      console.log('The access token was expired. Will pass the following data to the refresh token middleware...')
      console.log('refresh token verification: ', req.refreshTokenVerification)
      console.log('current refresh token: ', req.currentRefreshToken)
      console.log('refresh token payload: ', req.tokenPayload)
      return next()
    }else{
      return next(new invalidSignatureError('Invalid signature present on access token')) // Additional action required
    }
  }
  const ownerId = accessTokenPayload.ownerId
  req.ownerId = ownerId
  req.refreshTokenVerification = false
  req.accessTokenPayload = accessTokenPayload
  console.log('An account request has been received and the access token was valid. Here is the token payload:',accessTokenPayload)
  next()*/
}
export default verifyAccessToken
