import jwt from 'jsonwebtoken'
import queries from '../queries/queries.mjs'

const validateToken = (token,tokenType = 'access') => {
  const secret = tokenType == 'refresh' ? process.env.REFRESH_SECRET:process.env.ACCESS_SECRET
  console.log(process.env.ACCESS_TOKEN_SECRET)
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

const verifyRefreshToken = async (req,res,next) => {
  const refreshTokenVerification = req.refreshTokenVerification
  console.log('RefreshTokenVerification: ', refreshTokenVerification)
  if(refreshTokenVerification){
    console.log('The access token was invalid, but the refresh token was still valid. A new refresh and acces token were attempted to be created.')
    const refreshToken = req.currentRefreshToken
    const refreshTokenPayload = req.tokenPayload
    const ownerId = refreshTokenPayload.ownerId
    console.log('Identifier: ', ownerId)
    //Confirm token is the current token registered to owner making the request.
    const existingToken = await queries.getRefreshToken(ownerId)
    console.log('Existing refresh token, saved in db: ', existingToken)
    if(refreshToken != existingToken ) return res.send('ERROR: Refresh token received does not match token saved')
    // Need to save a NEW refresh token and send back a new access token
    const newRefreshToken = jwt.sign({ ownerId }, process.env.REFRESH_SECRET, {expiresIn : '14d'})
    const result = await queries.setNewRefreshToken(newRefreshToken,ownerId)
    if(result == 0) return res.send('ERROR: Refresh token was not updated in database')
    const newAccessToken = jwt.sign({ ownerId }, process.env.ACCESS_SECRET, {expiresIn : '15m'})
    res.locals.tokenData = { newRefreshToken, newAccessToken }
    console.log(`The new tokens were successfully created, they are are: access:${ newAccessToken }, refresh:${ newRefreshToken }`)
    return next()
  }
  console.log('Access token was valid; Refresh token middleware was skipped. Owner ID retrieved form access token is: ', req.ownerId)
  return next()
}

export default verifyRefreshToken