import jwt from 'jsonwebtoken'
// Custom Errors
import nullRefreshTokenError from '../errors/nullRefreshTokenError.mjs'
import nullAccessTokenError from '../errors/nullAccesTokenError.mjs'
import nullAdminError from '../errors/nullAdminPrivlidgesError.mjs'
import invalidSignatureError from '../errors/invalidSignatureError.mjs'


const validateToken = (token,tokenType = 'access') => {
  const secret = tokenType == 'refresh' ? process.env.REFRESH_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET
  try{
    const decodedJwt = jwt.verify(token,secret)
    return decodedJwt
  }catch(err){
    return err
  }
}

const checkExpiration = (token) => {
  const payload = decode(token)
  return payload.exp < (Date.now() / 1000) // Date.now() must be converted to seconds 
}

const verifyAccessToken = (req,res,next) => {
  const accessToken = req.headers['authorization']
  // Confirm access token exists. If not, send a custom error.
  if(!accessToken) return res.status(401).json({error:new nullAccessTokenError('Access token was not provided')}) // Handled by frontend
  // Validate the access token
  const accessTokenValidation = validateToken(accessToken)
  // Check for an error after validation
  if(accessTokenValidation instanceof Error){
    // Determine if the access token is expired.
    const expiredAccessToken = checkExpiration(accessToken)
    // If the access token is expired, confirm existence of and valdiate the refresh token.
    if(expiredAccessToken){
      const refreshToken = req.cookies.jwt
      // If a refresh token is not present, send a custom error.
      if(!refreshToken){
        return res.status(401).json({error: new nullRefreshTokenError('Refresh token was not provided; Requires sign-in')}) // Handled by frontend
      }
      const refreshTokenValidation = validateToken(refreshToken, 'refresh')
      // Return any error given after validation.
      if(refreshTokenValidation instanceof Error){
        const expiredRefreshToken = checkExpiration(refreshToken)
        if(expiredRefreshToken){
          return res.status(401).json({error: new Error('Refresh token is expired; Requires sign-in')}) // Handled by frontend
        }else{
          return next(new invalidSignatureError('Invalid signature present on refresh token')) // Additional action required
        }
      }
      // Trigger the need for a new access token and refresh token.
      req.refreshTokenVerification = true
      req.currentRefreshToken = refreshToken
      req.tokenPayload = refreshTokenValidation
      return next()
    }else{
      return next(new invalidSignatureError('Invalid signature present on access token')) // Additional action required
    }
  }
  console.log('An account request has been received and the access token was valid')
  next()
}
export default verifyAccessToken
