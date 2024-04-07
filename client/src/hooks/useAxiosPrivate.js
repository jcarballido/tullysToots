import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { axiosPrivate } from '../api/axios'
import useRefreshToken from './useRefreshToken'

const useAxiosPrivate = () => {

  const { auth } = useAuth()
  const refreshAccessToken = useRefreshToken()

  useEffect( () => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(  
      config  => {
        if(!config.headers['Authorization'] ){
          console.log('Request intercepted. Access token added: ', auth.accessToken)
          config.headers['Authorization'] = auth.accessToken
        } 
        return config 
      },
      err => {
        return Promise.reject(err)
      }
    )

    const responseInterceptor = axiosPrivate.interceptors.response.use( 
      response => {
        return response
      },
      async (err) => {
        const previousRequest = err.config
        console.log('Error config received in intercepted response interceptor: ', err.config)
        console.log('Config.sent? ', previousRequest.sent)
        if(err.response.status == 400 && !previousRequest.sent){
          previousRequest.sent = true
          const newAccessToken = await refreshAccessToken()
          console.log('Response intercepted. An error was recieved. New access token sent: ', newAccessToken)
          if(!newAccessToken){
            return Promise.reject(new Error('Error getting a new access token'))
          }
          previousRequest.headers['Authorization'] = newAccessToken
          console.log('Request was retried.')
          return axiosPrivate(previousRequest)
        }
        return Promise.reject(err)
      }
    )

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor)
      axiosPrivate.interceptors.response.eject(responseInterceptor)
    }
  },[auth, refreshAccessToken])

  return axiosPrivate
}

export default useAxiosPrivate