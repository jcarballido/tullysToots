import React,{ useState } from 'react'
import { Outlet } from 'react-router-dom'
import '../tailwind.css';
import Banner from '../components/Banner.js'
import Footer from '../components/Footer.js'
import AccountNavigation from '../components/AccountNavigation.js';
import useAuth from '../hooks/useAuth.js';
// import { AuthProvider } from '../context/AuthContext.js';

// const TextInput = ({ inputName }) => {
//   const [value, setValue] = useState('')

//   const handleInputChange = (e) => {
//       e.preventDefault()
//       const target = e.target
//       const input = target.value
//       setValue(input)
//   }

//   return(
//       <label for={`${inputName.toLowerCase()}`} className='flex flex-col items-start'>
//           {`${inputName}`}:
//           <input id={`${inputName.toLowerCase()}`} type='text' onChange={handleInputChange} />
//       </label>
//   )
// }

// const LoginForm = () => {
//   return(
//       <form className='border-2 border-black flex flex-col max-w-max'>
//           <TextInput inputName={'Username'} />
//           <TextInput inputName={'Password'} />
//           <button type='submit'>Submit</button>
//           New to Tully's Toots?
//           <button>
//               <a href='/signup'>Create an account</a>
//           </button > 
//       </form>
//   )
// }

// const Container = ({ children }) => {
//   return(
//       <div className='w-screen min-h-screen bg-violet-800 flex justify-center items-center'>
//           This a test
//           <LoginForm />
//       </div>
//   )
// }
// Root will serve as your app layout. Any components to be rendered inside of the root layout must be expressed as an 'Outlet' from the RR6.4 library
export const Home = () => {

  const [ slide,setSlide ] = useState(false)
  const { auth } = useAuth()

  return(
    <div className='w-screen h-screen max-h-screen bg-secondary flex flex-col justify-start items-center relative overflow-hidden'>
      <Banner slide={slide} setSlide={setSlide} auth={auth} />
      { auth?.accessToken
        ? <AccountNavigation slide={slide} setSlide={setSlide} />
        : null
      }
      <Outlet />
      <Footer />
    </div>
  )
}