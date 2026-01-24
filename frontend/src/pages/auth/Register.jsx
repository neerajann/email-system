import { useEffect, useState } from 'react'
import { domainEmailPattern, passwordPattern } from '../../utils/pattern'
import api from '../../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

const Register = () => {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [data, setData] = useState({
    name: '',
    emailAddress: '',
    password: '',
  })

  const [errors, setErrors] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSuccessMessage('')

    const newErrors = []
    if (data.name.trim().length < 5) {
      newErrors.name = 'Name must be at least 5 characters.'
    }

    if (!domainEmailPattern.test(data.emailAddress)) {
      newErrors.emailAddress = 'Invalid email address.'
    }
    if (!passwordPattern.test(data.password)) {
      newErrors.password =
        'Password must be at least 6 characters and include uppercase, lowercase, numbers, and symbols.'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    try {
      const result = await api.post('/auth/register', data)
      setSuccessMessage(result.data.success)
    } catch (error) {
      console.log(error)
      setSubmitError(error.response.data.error)
    }
  }

  useEffect(() => {
    if (!successMessage) return

    const timer = setTimeout(() => {
      navigate('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [successMessage])

  return (
    <div className='w-screen h-dvh flex items-center justify-center'>
      <div className=' bg-background border-border p-10 rounded-lg border flex-col max-w-150 w-full lg:w-1/2 m-5 lg:p-20 '>
        <div>
          <h1 className='sm:text-2xl text-xl text-foreground font-semibold text-center mb-8 '>
            Sign up for an account
          </h1>
        </div>
        <form method='post'>
          <div>
            <label
              htmlFor='name'
              className='font-medium block text-base md:text-sm '
            >
              Name
            </label>
            <input
              type='text'
              name='name'
              placeholder='Enter your name'
              className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3  shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
            {errors.name && (
              <span className='text-red-500 text-sm mt-3 block '>
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor='emailAddress'
              className='font-medium block text-base md:text-sm  mt-5'
            >
              Email address
            </label>
            <input
              type='email'
              name='emailAddress'
              placeholder='you@inboxify.com'
              className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) =>
                setData({ ...data, emailAddress: e.target.value })
              }
            />
            {errors.emailAddress && (
              <span className=' text-red-500 text-sm mt-3 block '>
                {errors.emailAddress}
              </span>
            )}
          </div>
          <div>
            <label
              htmlFor='password'
              className='font-medium block text-base md:text-sm  mt-5'
            >
              Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='*************'
                className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) => setData({ ...data, password: e.target.value })}
              ></input>
              <button
                type='button'
                className=' absolute top-1/2 right-6'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {errors.password && (
              <span className='text-red-500 text-sm mt-3 block '>
                {errors.password}
              </span>
            )}
            {submitError && (
              <span className=' text-red-500 text-sm mt-3 block '>
                {submitError}
              </span>
            )}
            {successMessage && (
              <span className=' text-green-500 text-sm mt-4 block '>
                {successMessage}
              </span>
            )}
          </div>
          <button
            type='submit'
            className='mt-8 w-full p-2 rounded-md border border-border bg-foreground text-background font-medium shadow-xs hover:scale-[0.97] transition-all active:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-ring/50'
            onClick={(e) => handleSubmit(e)}
          >
            Register
          </button>
        </form>
        <div className=' text-sm  mt-5 text-muted-foreground '>
          Already have an account?
          <Link
            to='/login'
            className=' underline underline-offset-3 ml-1 text-foreground'
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
export default Register
