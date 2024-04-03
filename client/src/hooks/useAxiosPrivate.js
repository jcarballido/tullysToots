import { useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import { axiosPrivate } from '../api/axios'

const useAxiosPrivate = () => {

  const { auth } = useAuth()

  useEffect( () => {
    const requestInterceptor = axiosPrivate.interceptors.request.use( config  => {
      if(!config.headers['Authorization'] ) return config },
      err => { return Promise.reject(err)}
    )

    const responseInterceptor = axiosPrivate.interceptors.use( response => {
      return response,
      err => {
        return Promise.reject(err)
      }
    })

    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor)
      axiosPrivate.interceptors.response.eject(responseInterceptor)
    }
  },[auth])

  return axiosPrivate
}

export default useAxiosPrivate