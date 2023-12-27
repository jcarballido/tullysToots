import jwt from 'jsonwebtoken'
import queries from '../queries/queries.mjs'

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

const verifyRefreshToken = async (req,res,next) => {
  const refreshTokenVerification = req.refreshTokenVerification
  if(refreshTokenVerification){
    console.log('The access token was invalid, but the refresh token wa still valid. A new refresh and acces token were attempted to be created.')
    const refreshToken = req.currentRefreshToken
    const refreshTokenPayload = req.tokenPayload
    const ownerId = refreshTokenPayload.ownerId
    //Confirm token is the current token registered to owner making the request.
    const existingToken = await queries.getRefreshToken(ownerId)
    if(refreshToken != existingToken ) return res.send('ERROR: Refresh token received does not match token saved')
    // Need to save a NEW refresh token and send back a new access token
    const newRefreshToken = jwt.sign({ ownerId }, process.env.REFRESH_SECRET, {expiresIn : '14d'})
    const result = await queries.setNewRefreshToken(newRefreshToken,ownerId)
    if(!result) return res.send('ERROR: Refresh token was not updated in database')
    const newAccessToken = jwt.sign({ ownerId }, process.env.ACCESS_SECRET, {expiresIn : '15m'})
    req.newRefreshToken = newRefreshToken
    req.newAccessToken = newAccessToken
    console.log(`The new tokens are, access:${ newAccessToken }, refresh:${ newRefreshToken }`)
    return next()
  }
  console.log('Access token was valid and no further action was taken.')
  return next()
}

export default verifyRefreshToken