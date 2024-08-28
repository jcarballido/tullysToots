import React from 'react'
import { axiosPrivate } from '../api/axios'
import EmailInput from '../components/EmailInput'

const ForgotPassword = () => {

  const [ invalidEmail, setInvalidEmail] = useState(true)

  return (
    <>
      <div>ForgotPassword</div>    
      <Form className='flex flex-col w-full px-8 mb-4' method='post' action={ `/forgotPassword` }>
        <EmailInput setInvalidEmail={setInvalidEmail} />
        <button disabled={Boolean( invalidEmail )} type='submit' className={`flex justify-center items-center min-w-[44px] min-h-[44px] rounded-lg bg-[#40e0d0] text-black mt-2 disabled:bg-gray-300 disabled:text-gray-500`}>
          SUBMIT
        </button>
      </Form>
    </>
  )
}

export const action = async( { request } ) => {
  const formData = await request.formData()
  const email = formData.get('email')

  try{
      const response = await axiosPrivate.post('/account/forgotPassword', { email })
      const { success } = response.data
      return { success }
  }catch(err){
      const error = err.response.data.error
      return { error }
  }
}

export default ForgotPassword