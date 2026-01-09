import { useRef, useState } from 'react'
import axios from 'axios'
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { domainEmailPattern } from './utils/pattern'

const Login = () => {
  const [data, setData] = useState({
    emailAddress: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const emailErrorRef = useRef(null)
  const passwordErrorRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!data.emailAddress.length) {
      return (emailErrorRef.current.textContent = 'Email address is required.')
    }
    if (!domainEmailPattern.test(data.emailAddress)) {
      return (emailErrorRef.current.textContent = 'Invalid email address')
    }

    if (!data.password.trim().length) {
      console.log(data.password)
      return (passwordErrorRef.current.textContent = 'Password is required.')
    }

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        data
      )
      console.log(result)
    } catch (error) {
      passwordErrorRef.current.textContent = error.response.data.error
    }
    passwordErrorRef.current.textContent = ''
    emailErrorRef.current.textContent = ''
  }
  return (
    <div className='bg-white p-10 rounded-lg border flex-col max-w-160 w-full lg:w-1/2 m-5 lg:p-20 shadow-xl shadow-[#1a050517]'>
      <div>
        <h1 className='text-black font-semibold text-4xl '>
          Welcome back to Inboxify
        </h1>
        <p className='text-black font-medium text-lg my-4'>
          Please enter your login details
        </p>
      </div>
      <form method='post'>
        <div>
          <label htmlFor='emailAddress' className='font-medium block text-lg'>
            Email Address
          </label>
          <input
            type='email'
            name='emailAddress'
            placeholder='Enter your email'
            className='font-medium text w-full mt-3 border p-2 rounded'
            onChange={(e) => setData({ ...data, emailAddress: e.target.value })}
          />
          <span
            className=' text-red-600 font-medium mt-3 block'
            ref={emailErrorRef}
          ></span>
        </div>
        <div>
          <label htmlFor='password' className='font-medium block text-lg mt-4'>
            Password
          </label>
          <div className='relative w-full'>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Enter your password'
              className='font-medium text w-full mt-3 border p-2 rounded'
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            <button
              type='button'
              className='absolute top-1/2 right-4'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOutline /> : <IoEyeOffOutline />}
            </button>
          </div>{' '}
          <span
            className=' text-red-600 font-medium mt-4 block'
            ref={passwordErrorRef}
          ></span>
        </div>
        <button
          type='submit'
          className='font-semibold text-xl mt-5 bg-black w-full py-3 rounded text-cyan-50 hover:scale-[1.03] ease-in  active:scale-[0.95] transition-all shadow-xl'
          onClick={(e) => handleSubmit(e)}
        >
          Login
        </button>
      </form>
    </div>
  )
}
export default Login
