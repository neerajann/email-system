import { useState } from 'react'
import { domainEmailPattern } from '../../utils/pattern.js'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useRef } from 'react'

const Login = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const formData = useRef({
    emailAddress: '',
    password: '',
  })

  const [submitErrors, setSubmitErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.current.emailAddress.length) {
      setSubmitErrors({
        emailAddress: 'Email address is required.',
      })
      return
    } else if (!domainEmailPattern.test(formData.current.emailAddress)) {
      setSubmitErrors({
        emailAddress: 'Invalid email address.',
      })
      return
    }

    if (!formData.current.password.trim().length) {
      setSubmitErrors({
        password: 'Password is required.',
      })
      return
    }

    try {
      const { data } = await api.post('/auth/login', formData.current)

      if (data.success) {
        setUser(formData.current.emailAddress)
        navigate('/inbox')
      }
    } catch (error) {
      setSubmitErrors({
        password: error?.response?.data?.error || 'Login failed',
      })
    }
  }

  return (
    <div className='w-screen h-dvh flex items-center justify-center'>
      <div className='bg-background border-border p-7 rounded-lg border flex-col max-w-150 w-full lg:w-1/2 py-12 lg:p-20 mx-2 sm:mx-0 '>
        <div>
          <h1 className='text-2xl font-semibold text-center mb-8'>
            Welcome back to {import.meta.env.VITE_DOMAIN_NAME.split('.')[0]}
          </h1>
        </div>

        <form method='post' className='space-y-5'>
          <div>
            <label className='block  font-medium text-base md:text-sm  mb-3'>
              Email address
            </label>

            <div className='relative  mt-3'>
              <input
                type='email'
                autoComplete='off'
                placeholder='Enter your username'
                className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) =>
                  (formData.current.emailAddress =
                    e.target.value + `@${import.meta.env.VITE_DOMAIN_NAME}`)
                }
              />
              <span className='absolute top-1/2 right-3.5 -translate-y-1/2 text-sm '>
                @{import.meta.env.VITE_DOMAIN_NAME}
              </span>
            </div>
          </div>
          {submitErrors.emailAddress && (
            <span className=' text-red-500 text-sm mt-3 block'>
              {submitErrors.emailAddress}
            </span>
          )}

          <div>
            <label className='block font-medium text-base md:text-sm '>
              Password
            </label>
            <div className='relative mt-3'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='*************'
                className='text-base md:text-sm w-full h-10 bg-input text-foreground border border-border rounded-md  p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) => (formData.current.password = e.target.value)}
              />
              <button
                type='button'
                className=' absolute top-1/2 right-3 cursor-pointer -translate-y-1/2 w-10 h-10 flex items-center justify-center'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {submitErrors.password && (
              <span className='text-red-500 text-sm mt-4 block'>
                {submitErrors.password}
              </span>
            )}
          </div>

          <button
            type='submit'
            onClick={(e) => handleSubmit(e)}
            className='mt-5 w-full p-2 rounded-md border border-border bg-foreground text-background font-medium shadow-xs active:scale-[1.02] transition-all ease-in-out hover:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50'
          >
            Login
          </button>
        </form>

        <div className='text-sm mt-5 text-muted-foreground'>
          Don&apos;t have an account?
          <Link
            to='/register'
            className='underline underline-offset-3 ml-1 text-foreground'
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}
export default Login
