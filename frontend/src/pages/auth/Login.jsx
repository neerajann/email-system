import { useState } from 'react'
import { domainEmailPattern } from '../../utils/pattern'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    emailAddress: '',
    password: '',
  })

  const [submitErrors, setSubmitErrors] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}

    if (!formData.emailAddress.length) {
      newErrors.emailAddress = 'Email address is required.'
    } else if (!domainEmailPattern.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Invalid email address.'
    }

    if (!formData.password.trim().length) {
      newErrors.password = 'Password is required.'
    }

    setSubmitErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    try {
      const { data } = await api.post('/auth/login', formData)

      if (data.success) {
        setUser(formData.emailAddress)
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
      <div className='bg-background border-border p-10 rounded-lg border flex-col max-w-150 w-full lg:w-1/2 m-5 lg:p-20 '>
        <div>
          <h1 className='sm:text-2xl text-xl font-semibold text-center mb-8'>
            Welcome back to Inboxify
          </h1>
        </div>

        <form method='post' className='space-y-5'>
          <div>
            <label
              htmlFor='emailAddress'
              className='block font-medium text-base md:text-sm  mb-3'
            >
              Email address
            </label>

            <input
              type='email'
              name='emailAddress'
              placeholder='you@inboxify.com'
              className='text-base md:text-sm  w-full bg-input text-foreground border border-border rounded-md p-2 pl-3  shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) =>
                setFormData({ ...formData, emailAddress: e.target.value })
              }
            />

            {submitErrors.emailAddress && (
              <span className=' text-red-500 text-sm mt-3 block'>
                {submitErrors.emailAddress}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor='password'
              className='block font-medium text-base md:text-sm  mb-3'
            >
              Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='*************'
                className='text-base md:text-sm w-full h-10 bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type='button'
                className=' absolute top-1/2 right-6'
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
            className='mt-5 w-full p-2 rounded-md border border-border bg-foreground text-background font-medium shadow-xs hover:scale-[0.97] transition-all active:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-ring/50'
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
