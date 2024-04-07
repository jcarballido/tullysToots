import axios from "../api/axios"
import useAuth from "./useAuth"

const useRefreshToken = () => {
  const { setAuth } = useAuth()

  const refreshAccessToken = async () => {
    try{
      const response = await axios.get('/account/refreshAccessToken',{ withCredentials: true })
      console.log('useRefreshToken hook called. Response from fetching a new token: ', response)
      setAuth( prevAuth => {
        return { ...prevAuth, accessToken:response.data.newAccessToken}
      })
      return response.data.newAccessToken
    }catch(e){
      setAuth( prevAuth => {
        return { ...prevAuth, accessToken:null, isLoggedIn:false}
      })
    }
  }
  return refreshAccessToken
}

export default useRefreshToken