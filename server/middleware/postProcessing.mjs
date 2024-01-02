const postProcessing = (req,res) => {
  // First, check if new authentication tokens need to be sent back to the client.
  const tokenData = res.locals.tokenData
  const error = res.locals.error
  const message = res.locals.message
  const data = res.locals.data
  
  // Send the new tokens with the results from the previous middleware
  if(typeof tokenData !== 'undefined'){
    const newAccessToken = tokenData.newAccessToken
    const newRefreshToken = tokenData.newRefreshToken
    if( typeof error !== 'undefined'){
      return res.status(400).json({ error, newAccessToken, newRefreshToken })
    }else if( typeof message !== 'undefined'){
      return res.status(200).json({ message, newAccessToken, newRefreshToken })
    }else{
      return res.status(200).json({ data, newAccessToken, newRefreshToken })
    }
  }else{
    if( typeof error !== 'undefined'){
      return res.status(400).json({ error })
    }else if( typeof message !== 'undefined'){
      return res.status(200).json({ message })
    }else{
      return res.status(200).json({ data })
    }
  }  
}

export default postProcessing