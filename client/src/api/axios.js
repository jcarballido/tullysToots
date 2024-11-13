import axios from 'axios'

const baseURL = 'https://tullystoots.onrender.com'

export default axios.create({
  baseURL
})

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true
})