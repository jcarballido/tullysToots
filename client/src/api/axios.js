import axios from 'axios'

const baseURL = 'https://tullystoots.onrender.com'

// const baseURL = 'http://localhost:3000'


export default axios.create({
  baseURL
})

export const axiosPrivate = axios.create({
  baseURL,
  withCredentials: true
})