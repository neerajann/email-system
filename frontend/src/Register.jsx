import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { useRef, useState } from 'react'
import { domainEmailPattern, passwordPattern } from './utils/pattern'
import axios from 'axios'

const Register = () => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const fnameErrorRef = useRef(null)
  const lnameErrorRef = useRef(null)
  const emailErrorRef = useRef(null)
  const passwordErrorRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (data.firstName.trim().length < 5) {
      return (fnameErrorRef.current.textContent =
        'First name must be at least 5 characters.')
    }
    if (data.lastName.trim().length < 5) {
      return (lnameErrorRef.current.textContent =
        'Last name must be at least 5 characters.')
    }
    if (!domainEmailPattern.test(data.emailAddress)) {
      return (emailErrorRef.current.textContent = 'Invalid email address.')
    }
    if (!passwordPattern.test(data.password)) {
      return (passwordErrorRef.current.textContent =
        'Password must be at least 6 character long and includes uppercase, lowercase, numbers and symbols')
    }
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        data
      )
      passwordErrorRef.current.style.color = 'green'
      return (passwordErrorRef.current.textContent = result.data.sucess)
    } catch (error) {
      console.log(error)
      return (passwordErrorRef.current.textContent = error.response.data.error)
    }
  }

  return (
    <div className='bg-white p-10 rounded-lg border flex-col max-w-150 w-full lg:w-1/2 m-5 lg:p-20 shadow-xl shadow-[#1a050517]'>
      <div>
        <h1 className='text-black font-semibold text-4xl '>
          Welcome to Inboxify
        </h1>
        <p className='text-black font-medium text-lg my-4'>
          Get started by simply creating an account
        </p>
      </div>
      <form method='post'>
        <div>
          <label htmlFor='firstName' className='font-medium block text-lg'>
            First Name
          </label>
          <input
            type='text'
            name='firstName'
            placeholder='Enter your first name'
            className='font-medium text w-full mt-3 border p-2 rounded'
            onChange={(e) => setData({ ...data, firstName: e.target.value })}
          />
          <span
            className=' text-red-600 font-medium mt-4 block'
            ref={fnameErrorRef}
          ></span>
        </div>
        <div>
          <label htmlFor='lastName' className='font-medium block text-lg mt-4'>
            Last Name
          </label>
          <input
            type='text'
            name='lastName'
            placeholder='Enter your last name'
            className='font-medium text w-full mt-3 border p-2 rounded'
            onChange={(e) => setData({ ...data, lastName: e.target.value })}
          />
          <span
            className=' text-red-600 font-medium mt-4 block'
            ref={lnameErrorRef}
          ></span>
        </div>
        <div>
          <label
            htmlFor='emailAddress'
            className='font-medium block text-lg mt-4'
          >
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
            className=' text-red-600 font-medium mt-4 block'
            ref={emailErrorRef}
          ></span>
        </div>
        <div>
          <label htmlFor='password' className='font-medium block text-lg mt-4'>
            Password
          </label>
          <div className='relative'>
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
          </div>
          <span
            className=' text-red-600 font-medium mt-4 block'
            ref={passwordErrorRef}
          ></span>
        </div>
        <button
          type='submit'
          className='font-semibold text-xl mt-7 bg-black w-full py-3 rounded text-cyan-50 hover:scale-[1.03] ease-in  active:scale-[0.95] transition-all shadow-xl'
          onClick={(e) => handleSubmit(e)}
        >
          Register
        </button>
      </form>
    </div>
  )
}
export default Register
